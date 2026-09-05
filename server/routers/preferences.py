import json
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_db_connection
from routers.auth import get_current_user_id

router = APIRouter(prefix="/api/preferences", tags=["preferences"])

# Schema
class PreferencesRequest(BaseModel):
    interested_assets: List[str]
    investor_type: str
    content_types: List[str]

@router.post("")
def save_preferences(
    prefs: PreferencesRequest,
    user_id: str = Depends(get_current_user_id)
):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Upsert preferences
            cur.execute(
                """
                INSERT INTO user_preferences (user_id, interested_assets, investor_type, content_types)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id) DO UPDATE 
                SET interested_assets = EXCLUDED.interested_assets,
                    investor_type = EXCLUDED.investor_type,
                    content_types = EXCLUDED.content_types;
                """,
                (user_id, prefs.interested_assets, prefs.investor_type, prefs.content_types)
            )
            conn.commit()
            return {"message": "Preferences saved successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save preferences: {str(e)}")
    finally:
        conn.close()

@router.get("")
def get_preferences(user_id: str = Depends(get_current_user_id)):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT interested_assets, investor_type, content_types 
                FROM user_preferences 
                WHERE user_id = %s;
                """,
                (str(user_id),)
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Preferences not found")

            # Parse lists or JSON strings safely
            def parse_field(val):
                if isinstance(val, list):
                    return val
                if isinstance(val, str):
                    try:
                        return json.loads(val)
                    except Exception:
                        return [val]
                return []

            if isinstance(row, dict):
                assets = row.get("interested_assets")
                inv_type = row.get("investor_type")
                contents = row.get("content_types")
            else:
                assets = row[0]
                inv_type = row[1]
                contents = row[2]

            return {
                "interested_assets": parse_field(assets),
                "investor_type": inv_type,
                "content_types": parse_field(contents)
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG ERROR in get_preferences: {type(e).__name__} - {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch preferences: {str(e)}")
    finally:
        conn.close()