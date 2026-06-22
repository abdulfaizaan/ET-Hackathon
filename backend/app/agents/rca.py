import os
from typing import Dict, Any
from app.database.database import neo4j_manager, qdrant_client, collection_name
from llama_index.core import Settings

async def generate_rca(equipment_tag: str) -> str:
    # 1. Traverse Graph for Incidents
    cypher = """
    MATCH (a:Asset {tag: $tag})-[r]-(n)
    RETURN type(r) as relationship, n
    """
    records = neo4j_manager.run_query(cypher, {"tag": equipment_tag})
    
    graph_data = []
    for record in records:
        graph_data.append(f"{record['relationship']}: {dict(record['n'])}")
        
    # 2. Vector Context (Optional limit context)
    embedding = Settings.embed_model.get_text_embedding(equipment_tag)
    search_result = qdrant_client.search(
        collection_name=collection_name,
        query_vector=embedding,
        limit=2
    )
    
    vector_data = [hit.payload.get("text", "") for hit in search_result]
    
    # 3. Chain of Thought Prompt
    prompt = f"""
    Perform a Root Cause Analysis (RCA) for the equipment tag: {equipment_tag}.
    
    Historical Graph Context (Incidents/Docs):
    {chr(10).join(graph_data)}
    
    Manual/Operating Limits:
    {chr(10).join(vector_data)}
    
    Please provide a structured chain-of-thought hypothesis for why failures might be occurring based ONLY on the provided context.
    """
    
    response = Settings.llm.complete(prompt)
    return response.text
