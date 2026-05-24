from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
from app.config import settings
from app.routers import routes, steps, uploads, profiles
from app.dependencies import require_auth

app = FastAPI(title="Balangay API", version="1.0.0")

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_cors_to_errors(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        tb = traceback.format_exc()
        print("=== ERROR ===")
        print(tb)
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "traceback": tb},
            headers={"Access-Control-Allow-Origin": "http://localhost:5173",
                     "Access-Control-Allow-Credentials": "true"},
        )

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/test-auth")
def test_auth(user: dict = Depends(require_auth)):
    return {"user_id": user["sub"], "email": user.get("email")}

app.include_router(routes.router,   prefix="/api/routes",   tags=["routes"])
app.include_router(steps.router,    prefix="/api/routes",   tags=["steps"])
app.include_router(uploads.router,  prefix="/api/upload",   tags=["uploads"])
app.include_router(profiles.router, prefix="/api/profiles", tags=["profiles"])
