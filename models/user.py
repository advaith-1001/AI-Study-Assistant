from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID, SQLAlchemyBaseOAuthAccountTableUUID
from sqlalchemy import String
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.testing.schema import mapped_column
from models.base import Base
from httpx_oauth.clients.google import GoogleOAuth2

google_oauth_client = GoogleOAuth2("384019302846-p21jg0aumu6usu20ti0hvr6n2nop7l09.apps.googleusercontent.com",
                                   "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")


class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    pass

class User(SQLAlchemyBaseUserTableUUID, Base):
    oauth_accounts: Mapped[list[OAuthAccount]] = relationship(
        "OAuthAccount", lazy="joined"
    )
    __tablename__ = "user"

    username = mapped_column(String, unique=True, index=True)
    pathways = relationship("Pathway", back_populates="user")