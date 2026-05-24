from fastapi import APIRouter, Depends, HTTPException
from app.models import StepCreate, StepOut
from app.dependencies import require_auth
from app.services.supabase_client import supabase

router = APIRouter()


def _assert_owner(route_id: str, user_sub: str):
    r = (
        supabase.table("routes")
        .select("user_id")
        .eq("id", route_id)
        .single()
        .execute()
    )
    if not r.data or r.data["user_id"] != user_sub:
        raise HTTPException(403, "Not your route")


@router.get("/{route_id}/steps", response_model=list[StepOut])
def get_steps(route_id: str):
    result = (
        supabase.table("steps")
        .select("*")
        .eq("route_id", route_id)
        .order("step_index")
        .execute()
    )
    return result.data


@router.put("/{route_id}/steps", response_model=list[StepOut])
def replace_steps(
    route_id: str,
    steps: list[StepCreate],
    user: dict = Depends(require_auth),
):
    """Delete all existing steps for a route and insert the new list."""
    _assert_owner(route_id, user["sub"])
    supabase.table("steps").delete().eq("route_id", route_id).execute()
    if not steps:
        return []
    data = [
        {
            **s.model_dump(mode="json"),
            "route_id": route_id,
        }
        for s in steps
    ]
    result = supabase.table("steps").insert(data).execute()
    return result.data