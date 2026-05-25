from fastapi import APIRouter, HTTPException, Depends
from postgrest.exceptions import APIError
from app.services.supabase_client import supabase
from app.dependencies import require_auth

router = APIRouter()

@router.get("/by-id/{user_id}")
def get_profile_by_id(user_id: str, user: dict = Depends(require_auth)):
    if user["sub"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    except APIError:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data

@router.get("/{username}")
def get_profile(username: str):
    try:
        result = (
            supabase.table("profiles")
            .select("*")
            .eq("username", username)
            .single()
            .execute()
        )
    except APIError:
        raise HTTPException(status_code=404, detail="Profile not found")
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = result.data
    routes_result = (
        supabase.table("routes")
        .select("*")
        .eq("user_id", profile["id"])
        .eq("is_public", True)
        .order("created_at", desc=True)
        .execute()
    )
    return {**profile, "routes": routes_result.data or []}