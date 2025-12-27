from uuid import UUID
import os
from dotenv import load_dotenv

from fastapi_users import FastAPIUsers
from fastapi_users.authentication import CookieTransport, JWTStrategy
from fastapi_users.authentication import AuthenticationBackend

from core.user_manager import get_user_manager
from models.user import User

load_dotenv()

# Use secure secret from environment variable
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

# Access token: short-lived (15 minutes) for security
# Refresh token: longer-lived (7 days) for convenience
ACCESS_TOKEN_LIFETIME = 900  # 15 minutes
REFRESH_TOKEN_LIFETIME = 604800  # 7 days

# HttpOnly cookie with refresh token lifetime
cookie_transport = CookieTransport(
    cookie_name="auth",
    cookie_max_age=REFRESH_TOKEN_LIFETIME,  # Use refresh token lifetime for cookie
    cookie_httponly=True,
    cookie_secure=False,  # Set to True in production with HTTPS
    cookie_samesite="lax",  # Protect against CSRF
)

def get_jwt_strategy():
    # Short-lived access token for API requests
    return JWTStrategy(secret=SECRET_KEY, lifetime_seconds=ACCESS_TOKEN_LIFETIME)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, UUID](
    get_user_manager,
    [auth_backend],
)