from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict
from langchain.schema import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from db import memory_collection
import json

chat_router = APIRouter()
llm = ChatOpenAI(model="gpt-4", temperature=0.4)

# --- Input model ---
class ChatRequest(BaseModel):
    session_id: str
    message: str
    course_data: Optional[Dict] = None

# --- Memory functions ---
def get_history(session_id: str):
    doc = memory_collection.find_one({"session_id": session_id})
    return doc["history"] if doc and "history" in doc else []

def save_history(session_id: str, history: list):
    memory_collection.update_one(
        {"session_id": session_id},
        {"$set": {"history": history}},
        upsert=True
    )

# --- Chat Endpoint ---
@chat_router.post("/chat")
async def chat_with_ai(data: ChatRequest):
    history_raw = get_history(data.session_id)
    
    # Rebuild LangChain messages from raw dicts
    messages = []
    for item in history_raw:
        role = item["role"]
        content = item["content"]
        messages.append(HumanMessage(content) if role == "human" else AIMessage(content))

    if data.course_data:
        messages.append(HumanMessage(content=f"Course data:\n{json.dumps(data.course_data)}"))

    messages.append(HumanMessage(content=data.message))
    response = await llm.ainvoke(messages)

    # Store back in history
    history_raw.append({"role": "human", "content": data.message})
    history_raw.append({"role": "ai", "content": response.content})
    save_history(data.session_id, history_raw)

    return {"response": response.content}
