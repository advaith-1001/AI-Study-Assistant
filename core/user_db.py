from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from models.user import OAuthAccount
from core.db import async_session_maker


async def get_async_session():
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User, OAuthAccount)