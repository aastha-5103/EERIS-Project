from fastapi import APIRouter, HTTPException
from db import get_user_by_email, add_user

router = APIRouter()

# ✅ LOGIN ROUTE
@router.post("/login")
def login(credentials: dict):
    email = credentials.get("email")
    password = credentials.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    user = get_user_by_email(email)

    if not user or user["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
    "userId": user.get("username"),
    "role": user.get("role"),
    "email": user.get("email"),
    "firstName": user.get("firstName"),
    "lastName": user.get("lastName"),
    "empId": user.get("empId"),
    "budget": user.get("allocated", 0)
}



# ✅ REGISTRATION (used only by HR or admin manually)
@router.post("/register")
def register(user_data: dict):
    email = user_data.get("email")

    if get_user_by_email(email):
        raise HTTPException(status_code=400, detail="Email already exists")

    add_user(user_data)
    return {"message": "User registered successfully"}
