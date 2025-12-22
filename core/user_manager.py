import uuid
from typing import Optional

from fastapi_users import BaseUserManager, UUIDIDMixin
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID
from fastapi import Depends, Request
from fastapi_mail import FastMail, MessageSchema, MessageType
from core.user_db import get_user_db
from core.email import conf
from models.user import User

SECRET = "SUPER_SECRET_KEY"


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Request | None = None):
        """
        This hook is called right after a user registers.
        We'll trigger the verification email flow from here.
        """
        print(f"User {user.id} registered successfully")

        if user.is_active and not user.is_verified:
            try:
                # This built-in method creates the token and
                # calls on_after_request_verification
                await self.request_verify(user, request)
            except Exception as e:
                print(f"Failed to send verification email for {user.email}: {e}")
                # You could log this error

    async def on_after_request_verify(
            self, user: User, token: str, request: Request | None = None
    ):
        """
        This hook is called after a verification token is generated.
        This is where you send the actual email.
        """
        print(f"Verification requested for user {user.id}. Token: {token}")

        # This is the URL your Next.js frontend will use
        # Your frontend will take the token and send it to your
        # POST /auth/verify endpoint
        verify_url = f"http://localhost:3000/auth/verify?token={token}"  # Change to your frontend URL

        html_content = f"""
        <html>
        <body>
            <h1>Welcome, {user.username}!</h1>
            <p>Thanks for registering. Please click the link below to verify your email address:</p>
            <a href="{verify_url}">Verify Your Email</a>
            <p>If you did not register, please ignore this email.</p>
        </body>
        </html>
        """

        message = MessageSchema(
            subject="Verify Your Email",
            recipients=[user.email],
            body=html_content,
            subtype=MessageType.html
        )

        try:
            fm = FastMail(conf)
            await fm.send_message(message)
            print(f"Verification email sent to {user.email}")
        except Exception as e:
            print(f"Failed to send verification email: {e}")
            # Handle email sending failure (e.g., log it)

    async def on_after_oauth_registration(
            self, user: User, oauth_account: dict, request: Optional[Request] = None
    ):
        # Google provides 'name' or 'given_name' in the oauth_account data
        google_name = oauth_account.get("name")
        if google_name:
            # Update the user record with the real name from Google
            user.username = google_name
            await self.user_db.update(user)
        print(f"User {user.id} registered with OAuth account {oauth_account['account_id']}")

    async def on_after_forgot_password(
            self, user: User, token: str, request: Request | None = None
    ):
        """
        This hook is called after a password-reset token is generated.
        """
        print(f"Password reset requested for user {user.id}. Token: {token}")

        # This is the URL your Next.js frontend will use
        reset_url = f"http://localhost:3000/auth/reset-password?token={token}"

        html_content = f"""
        <html>
        <body>
            <p>Hello, {user.username}.</p>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <a href="{reset_url}">Reset Your Password</a>
            <p>If you did not request this, please ignore this email.</p>
        </body>
        </html>
        """

        message = MessageSchema(
            subject="Reset Your Password",
            recipients=[user.email],
            body=html_content,
            subtype=MessageType.html
        )

        try:
            fm = FastMail(conf)
            await fm.send_message(message)
            print(f"Password reset email sent to {user.email}")
        except Exception as e:
            print(f"Failed to send password reset email: {e}")

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
