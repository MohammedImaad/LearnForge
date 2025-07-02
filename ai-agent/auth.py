# auth.py

from fastapi import APIRouter
from pydantic import BaseModel
from db import users_collection

auth_router = APIRouter()

class LoginPayload(BaseModel):
    username: str
    password: str

@auth_router.post("/login")
def login_user(payload: LoginPayload):
    user = users_collection.find_one({
        "username": payload.username,
        "password": payload.password  # 🔐 In production, use hashed passwords!
    })

    if not user:
        return {"error": "Invalid username or password"}

    return {"message": "Login successful", "type": user["type"]}
