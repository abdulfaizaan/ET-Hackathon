import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.ingestion import process_document
from app.agents.graphrag import answer_query
from app.agents.rca import generate_rca

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    chat_history: Optional[List[dict]] = []

@router.post("/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    document_type: str = Form(...)
):
    try:
        # Save file to temp folder or process from memory
        content = await file.read()
        filename = file.filename
        
        result = await process_document(content, filename, document_type)
        return {"status": "success", "message": f"Processed {filename}", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        response_data = await answer_query(request.query, request.chat_history)
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/rca/{equipment_tag}")
async def rca_endpoint(equipment_tag: str):
    try:
        rca_result = await generate_rca(equipment_tag)
        return {"equipment_tag": equipment_tag, "rca": rca_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
