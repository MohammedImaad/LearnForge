# auth.py

from fastapi import APIRouter
from pydantic import BaseModel
from db import users_collection

auth_router = APIRouter()

class LoginPayload(BaseModel):
    username: str
    password: str


class SignupPayload(BaseModel):
    username: str
    password: str

@auth_router.post("/signup")
def signup_user(payload: SignupPayload):
    # Check if username already exists
    existing_user = users_collection.find_one({"username": payload.username})
    if existing_user:
        return {"error": "Username already exists"}

    # Insert new user with type 'teacher'
    new_user = {
        "username": payload.username,
        "password": payload.password,  # 🔐 Hash in production
        "type": "teacher"
    }
    users_collection.insert_one(new_user)

    return {"message": "Signup successful", "type": new_user["type"]}

@auth_router.post("/login")
def login_user(payload: LoginPayload):
    user = users_collection.find_one({
        "username": payload.username,
        "password": payload.password  # 🔐 In production, use hashed passwords!
    })

    if not user:
        return {"error": "Invalid username or password"}

    return {"message": "Login successful", "type": user["type"]}
