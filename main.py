
from uuid import UUID
import os
from dotenv import load_dotenv
from core.auth import fastapi_users, auth_backend
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import CookieTransport, JWTStrategy, AuthenticationBackend
from core.user_manager import get_user_manager
from core.db import init_db
from models import User, Pathway
from models.user import google_oauth_client
from schemas.user import UserRead, UserCreate, UserUpdate
from routes import learning_paths, topics
from fastapi.responses import FileResponse

load_dotenv()

app = FastAPI()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# Get environment variables
CSRF_SECRET = os.getenv("CSRF_SECRET")
OAUTH_SECRET = os.getenv("OAUTH_SECRET")
FRONTEND_CALLBACK_URL = os.getenv("FRONTEND_CALLBACK_URL", "http://localhost:5173/auth/callback")

if not CSRF_SECRET or not OAUTH_SECRET:
    raise ValueError("CSRF_SECRET and OAUTH_SECRET environment variables are required")

# Restrict CORS to specific origins and headers
ALLOWED_ORIGINS = [
    os.getenv("FRONTEND_URL"),
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()


app.include_router(fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"])
app.include_router(fastapi_users.get_register_router(UserRead, UserCreate), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_users_router(UserRead, UserUpdate), prefix="/users", tags=["users"])

# Custom auth routes for token refresh and verification
from routes.auth import router as auth_router
app.include_router(auth_router)

# Secure password reset routes (POST-based token exchange)
from routes.password_reset import router as password_reset_router
app.include_router(password_reset_router)

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
        OAUTH_SECRET,  # Use environment variable instead of hardcoded secret
        is_verified_by_default=True,
        redirect_url=FRONTEND_CALLBACK_URL,  # Use environment variable
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

