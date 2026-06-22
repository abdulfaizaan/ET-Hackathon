import io
import json
import pandas as pd
from typing import Dict, Any
from llama_index.core import Document, Settings
from app.database.database import neo4j_manager, qdrant_client, collection_name
from qdrant_client.http.models import PointStruct
from app.core.utils.cache import get_from_cache, set_in_cache
import uuid
import re
import os
from datetime import datetime
from google import genai
from google.genai import types

# Initialize client (ensure GEMINI_API_KEY is in environment)
gemini_client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

async def process_document(content: bytes, filename: str, doc_type: str) -> Dict[str, Any]:
    ext = os.path.splitext(filename)[1].lower()
    if not ext:
        ext = f".{doc_type}"

    # 1. Base validation for file types
    if ext not in ['.pdf', '.png', '.jpg', '.jpeg', '.csv', '.txt']:
        # Fallback for unknown text
        text_content = content.decode('utf-8', errors='ignore')
        return await _process_text_fallback(text_content, filename)
        
    if ext == '.csv':
        df = pd.read_csv(io.BytesIO(content))
        text_content = "\n".join([row.to_json() for _, row in df.iterrows()])
        return await _process_text_fallback(text_content, filename)
        
    # 2. Fix for Binaries (PDFs & Drawings) using Gemini's Native Multimodal Processing
    mime_type = "application/pdf" if ext == '.pdf' else f"image/{ext.replace('.','')}"
    
    # We default asset_class to something generic if unknown at this stage
    asset_class = "Industrial Asset"
    
    prompt = f"""
    You are an industrial data engineer parsing a document.
    Extract all text content, tables, maintenance records, or valve specifications precisely.
    If this is an engineering drawing or P&ID, extract every single equipment tag visible 
    along with its approximate localized bounding box inside the document in normalized coordinates [ymin, xmin, ymax, xmax] from 0 to 100.
    
    Return the output strictly as valid JSON matching this schema:
    {{
        "extracted_text": "string content...",
        "entities": [
            {{"Equipment_Tag": "P-201", "Asset_Class": "Pump", "bounding_box": [20, 25, 32, 35]}}
        ]
    }}
    """

    response = gemini_client.models.generate_content(
        model='gemini-1.5-pro',
        contents=[
            types.Part.from_bytes(data=content, mime_type=mime_type),
            prompt
        ],
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    
    try:
        result_json = json.loads(response.text)
        extracted_text = result_json.get("extracted_text", "")
        entities = result_json.get("entities", [])
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        extracted_text = "Parsing failed"
        entities = []
        
    # 3. Save to Vector Store (Qdrant)
    point_id = str(uuid.uuid4())
    
    # Embed using LlamaIndex settings
    embedding = Settings.embed_model.get_text_embedding(extracted_text)
    
    payload = {
        "text": extracted_text,
        "source_file": filename,
        "page_number": 1,
        "associated_tags": [e.get("Equipment_Tag") for e in entities if e.get("Equipment_Tag")],
        "ingested_at": datetime.utcnow().isoformat()
    }
    
    qdrant_client.upsert(
        collection_name=collection_name,
        points=[PointStruct(id=point_id, vector=embedding, payload=payload)]
    )
    
    # 4. Save to Graph Store (Neo4j)
    update_neo4j_graph(filename, entities)
    
    return {"chunks_processed": 1}

async def _process_text_fallback(text: str, filename: str) -> Dict[str, Any]:
    # Fallback logic for basic text processing if not a binary
    chunk_size = 1000
    text_chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
    results = []
    
    for idx, chunk in enumerate(text_chunks):
        entities = await extract_entities(chunk)
        point_id = str(uuid.uuid4())
        embedding = Settings.embed_model.get_text_embedding(chunk)
        payload = {
            "text": chunk,
            "source_file": filename,
            "page_number": idx + 1,
            "associated_tags": [e.get("Equipment_Tag") for e in entities if e.get("Equipment_Tag")],
            "ingested_at": datetime.utcnow().isoformat()
        }
        qdrant_client.upsert(
            collection_name=collection_name,
            points=[PointStruct(id=point_id, vector=embedding, payload=payload)]
        )
        update_neo4j_graph(filename, entities)
        results.append(payload)
    return {"chunks_processed": len(results)}

async def extract_entities(text: str) -> list:
    cache_key = f"extract_{hash(text)}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached
        
    prompt = f"""
    Extract the following entities from the text and return as a JSON array of objects:
    - Equipment_Tag (regex-normalized to uppercase alphanumeric, e.g., P-201)
    - Asset_Class (e.g., Pump, Valve)
    
    Text:
    {text}
    
    Output JSON ONLY.
    """
    
    response = Settings.llm.complete(prompt)
    try:
        content = response.text
        start = content.find('[')
        end = content.rfind(']') + 1
        if start != -1 and end != 0:
            entities = json.loads(content[start:end])
        else:
            entities = []
            
        for e in entities:
            if e.get("Equipment_Tag"):
                e["Equipment_Tag"] = re.sub(r'[^A-Z0-9-]', '', str(e["Equipment_Tag"]).upper())
                
        set_in_cache(cache_key, entities)
        return entities
    except Exception as e:
        print(f"Extraction error: {e}")
        return []

def update_neo4j_graph(filename: str, entities: list):
    for entity in entities:
        tag = entity.get("Equipment_Tag")
        asset_class = entity.get("Asset_Class", "Asset")
        
        # Sanitize asset_class to be a valid Neo4j label
        asset_class = re.sub(r'[^a-zA-Z0-9_]', '', str(asset_class)).capitalize()
        if not asset_class:
            asset_class = "Asset"
            
        if tag:
            box = entity.get("bounding_box")
            if box and len(box) == 4:
                # Convert to dict for Neo4j
                box_dict = {"ymin": box[0], "xmin": box[1], "ymax": box[2], "xmax": box[3]}
            else:
                box_dict = None
                
            # Dynamically inject the sanitized label into the query
            query = f"""
            MERGE (a:{asset_class} {{tag: $tag}})
            SET a.bounding_box = $box_dict, a.source_file = $filename
            MERGE (d:Document {{name: $filename}})
            MERGE (a)-[:MENTIONED_IN]->(d)
            """
            neo4j_manager.run_query(query, {"tag": tag, "filename": filename, "box_dict": box_dict})
