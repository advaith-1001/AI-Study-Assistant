
from uuid import UUID
from core.auth import fastapi_users, auth_backend
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import CookieTransport, JWTStrategy, AuthenticationBackend
from core.user_manager import get_user_manager
from core.db import init_db
from models import User, Pathway
from models.user import google_oauth_client
from schemas.user import UserRead, UserCreate, UserUpdate
from routes import learning_paths, topics
from fastapi.responses import FileResponse

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()


app.include_router(fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"])
app.include_router(fastapi_users.get_register_router(UserRead, UserCreate), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_users_router(UserRead, UserUpdate), prefix="/users", tags=["users"])

app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)

# This adds the /forgot-password and /reset-password endpoints
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_oauth_router(
        google_oauth_client,
        auth_backend,
        "SUPER_SECRET_KEY",
        is_verified_by_default=True,
        redirect_url="http://localhost:5173/auth/callback"
    ),
    prefix="/auth/google",
    tags=["auth"],
)

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)
app.include_router(learning_paths.router)
app.include_router(topics.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return {"status": "ok"}

