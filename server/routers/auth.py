import os
import datetime
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import jwt
from database import get_db_connection

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_jwt_key_12345")
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

# Dependency to extract and verify user ID from JWT
def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Schemas
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(user_data: RegisterRequest):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Check if email is already registered
        cur.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash password and insert user
        hashed_password = pwd_context.hash(user_data.password)
        cur.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
            RETURNING id, name, email
            """,
            (user_data.name, user_data.email, hashed_password)
        )
        new_user = cur.fetchone()
        conn.commit()

        # Generate JWT token valid for 7 days
        token_payload = {
            "sub": str(new_user["id"]),
            "email": new_user["email"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }
        token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

        return {"user": new_user, "token": token, "isFirstTime": True}
    finally:
        cur.close()
        conn.close()

@router.post("/login")
def login(user_data: LoginRequest):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Find user by email
        cur.execute("SELECT * FROM users WHERE email = %s", (user_data.email,))
        user = cur.fetchone()
        if not user or not pwd_context.verify(user_data.password, user["password"]):
            raise HTTPException(status_code=400, detail="Invalid email or password")

        # Check if user already completed the onboarding questionnaire
        cur.execute("SELECT id FROM user_preferences WHERE user_id = %s", (user["id"],))
        preferences = cur.fetchone()
        is_first_time = preferences is None

        # Generate JWT token valid for 7 days
        token_payload = {
            "sub": str(user["id"]),
            "email": user["email"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }
        token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

        return {
            "user": {"id": str(user["id"]), "name": user["name"], "email": user["email"]},
            "token": token,
            "isFirstTime": is_first_time
        }
    finally:
        cur.close()
        conn.close()