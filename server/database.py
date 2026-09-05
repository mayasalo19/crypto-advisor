import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        conn = psycopg2.connect(
            os.getenv("DATABASE_URL"),
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print("Database connection error:", e)
        raise HTTPException(status_code=500, detail="Database connection error")