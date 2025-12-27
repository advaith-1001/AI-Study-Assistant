from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID, SQLAlchemyBaseOAuthAccountTableUUID
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.testing.schema import mapped_column
from models.base import Base
from httpx_oauth.clients.google import GoogleOAuth2
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()



google_oauth_client = GoogleOAuth2(os.getenv("GOOGLE_CLIENT_ID"), os.getenv("GOOGLE_CLIENT_SECRET"),
                                   scopes=[
                                       "https://www.googleapis.com/auth/userinfo.profile",
                                       "https://www.googleapis.com/auth/userinfo.email",
                                       "openid"
                                   ]
                                   )


class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    """
    Extended OAuth account model to persist refresh tokens and expiration times
    """
    # Additional fields for token persistence
    refresh_token = mapped_column(Text, nullable=True)  # Store OAuth refresh token
    token_expiration = mapped_column(DateTime, nullable=True)  # When the OAuth token expires
    last_refreshed = mapped_column(DateTime, default=datetime.utcnow)  # Track last refresh

class User(SQLAlchemyBaseUserTableUUID, Base):
    oauth_accounts: Mapped[list[OAuthAccount]] = relationship(
        "OAuthAccount", lazy="joined"
    )
    __tablename__ = "user"

    username = mapped_column(String, unique=True, index=True)
    pathways = relationship("Pathway", back_populates="user")