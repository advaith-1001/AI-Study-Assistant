from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID, SQLAlchemyBaseOAuthAccountTableUUID
from sqlalchemy import String
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.testing.schema import mapped_column
from models.base import Base
from httpx_oauth.clients.google import GoogleOAuth2
import os
from dotenv import load_dotenv

load_dotenv()



google_oauth_client = GoogleOAuth2(os.getenv("GOOGLE_CLIENT_ID"), os.getenv("GOOGLE_CLIENT_SECRET"),
                                   scopes=[
                                       "https://www.googleapis.com/auth/userinfo.profile",
                                       "https://www.googleapis.com/auth/userinfo.email",
                                       "openid"
                                   ]
                                   )


class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    pass

class User(SQLAlchemyBaseUserTableUUID, Base):
    oauth_accounts: Mapped[list[OAuthAccount]] = relationship(
        "OAuthAccount", lazy="joined"
    )
    __tablename__ = "user"

    username = mapped_column(String, unique=True, index=True)
    pathways = relationship("Pathway", back_populates="user")