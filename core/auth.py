from uuid import UUID

from fastapi_users import FastAPIUsers
from fastapi_users.authentication import CookieTransport, JWTStrategy
from fastapi_users.authentication import AuthenticationBackend

from core.user_manager import get_user_manager
from models.user import User

cookie_transport = CookieTransport(cookie_name="auth", cookie_max_age=3600)

def get_jwt_strategy():
    return JWTStrategy(secret="SUPER_SECRET_KEY", lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, UUID](
    get_user_manager,
    [auth_backend],
)