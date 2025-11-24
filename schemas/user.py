from fastapi_users import schemas
from typing import Optional
from uuid import UUID

# What gets returned to the client
class UserRead(schemas.BaseUser[UUID]):
    username: Optional[str]

# What gets accepted during registration
class UserCreate(schemas.BaseUserCreate):
    username: Optional[str]


class UserUpdate(schemas.BaseUserUpdate):
    username: Optional[str]
