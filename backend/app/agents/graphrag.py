import re
from typing import Tuple, List
from llama_index.core import Settings
from app.database.database import neo4j_manager, qdrant_client, collection_name

async def answer_query(query: str, chat_history: List[dict] = None) -> dict:
    # 1. Extract Tag from Query
    # Simple regex for hackathon (e.g., P-201, V-104)
    tags_found = re.findall(r'[A-Z]-\d{3,}', query.upper())
    
    graph_context = ""
    citations = []
    neo4j_record = None
    
    if tags_found:
        tag = tags_found[0]
        # 2. Query Graph for Context and Bounding Box
        cypher = """
        MATCH (a {tag: $tag})
        OPTIONAL MATCH (a)-[r]-(connected)
        RETURN a.bounding_box AS box, a.source_file AS file, type(r) as relationship, connected
        """
        records = neo4j_manager.run_query(cypher, {"tag": tag})
        
        graph_context = f"Graph Data for {tag}:\n"
        for record in records:
            if neo4j_record is None:
                neo4j_record = {"box": record["box"], "file": record["file"]}
                
            rel = record["relationship"]
            node = record["connected"]
            if rel and node:
                graph_context += f"- {tag} {rel} {dict(node)}\n"
            
    # 3. Query Vector DB for Semantic Context
    embedding = Settings.embed_model.get_text_embedding(query)
    
    search_result = qdrant_client.search(
        collection_name=collection_name,
        query_vector=embedding,
        limit=3
    )
    
    vector_context = "Document Semantic Search Results:\n"
    for hit in search_result:
        payload = hit.payload
        text = payload.get("text", "")
        source = payload.get("source_file", "Unknown")
        vector_context += f"- Source: {source} (Score: {hit.score:.2f})\nContent: {text}\n\n"
        citations.append(source)
        
    # 4. Agent 2: The Synthesizer (Drafts the answer)
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.prompts import ChatPromptTemplate
    import os
    
    context = f"{graph_context}\n\n{vector_context}"
    
    # Initialize LangChain LLM
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0, api_key=os.environ.get("GOOGLE_API_KEY", ""))
    
    synthesizer_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are ForgeMind AI, an intelligent copilot for industrial assets. Use the provided Context to answer the user's question. If the Context contains conflicting information (e.g. two different work orders for the same asset), ALWAYS prioritize the information from the document with the most recent 'ingested_at' timestamp. If the answer is not in the context, state 'Information not found in database'."),
        ("user", "Context:\n{context}\n\nUser Query: {query}")
    ])
    
    synthesizer_chain = synthesizer_prompt | llm
    draft_response = await synthesizer_chain.ainvoke({"context": context, "query": query})
    draft_answer = draft_response.content
    
    # 5. Agent 3: The Verification/Safety Cop
    verification_prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a strict Industrial Safety Auditor. 
Your job is to review a drafted answer against the raw retrieved context.
Check for two things:
1. Does the answer contain ANY specific metric, date, or equipment tag that is NOT explicitly present in the context?
2. If there are conflicting records in the context, did the drafted answer rely on an older 'ingested_at' record instead of the newest one?
If the answer fails either check, you MUST rewrite it to be safe and accurate according to the newest records, and append a safety warning: "[SAFETY WARNING: Unverified or outdated metric stripped by Verification Agent]".
If no, return the drafted answer as is."""),
        ("user", "Context:\n{context}\n\nDrafted Answer:\n{draft_answer}")
    ])
    
    verification_chain = verification_prompt | llm
    final_response = await verification_chain.ainvoke({"context": context, "draft_answer": draft_answer})
    
    # Return actual dynamic metadata to the frontend
    return {
        "answer": final_response.content,
        "citations": list(set(citations)),
        "visual_grounding": {
            "has_coordinates": True if neo4j_record and neo4j_record.get("box") else False,
            "file": neo4j_record.get("file") if neo4j_record else None,
            "coordinates": neo4j_record.get("box") if neo4j_record else {"ymin": 0, "xmin": 0, "ymax": 0, "xmax": 0}
        }
    }
