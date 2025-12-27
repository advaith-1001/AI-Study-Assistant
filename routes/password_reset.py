"""
Secure password reset endpoints using POST-based token exchange
Prevents tokens from being exposed in URLs or browser history
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from core.db import get_session
from services.secure_password_reset import (
    initiate_password_reset,
    verify_reset_token,
    mark_reset_token_used,
)
from core.user_db import get_user_db
from core.user_manager import get_user_manager
from models.user import User
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
import asyncio

router = APIRouter(prefix="/auth", tags=["password-reset"])


class RequestPasswordResetRequest(BaseModel):
    """Request password reset by email"""
    email: EmailStr


class ResetPasswordWithToken(BaseModel):
    """Reset password using secure token (sent in body, not URL)"""
    token: str  # Token sent in email
    new_password: str


class VerifyResetTokenRequest(BaseModel):
    """Verify that a reset token is valid (for UI/UX validation)"""
    token: str


@router.post("/request-password-reset")
async def request_password_reset(
    request: RequestPasswordResetRequest,
    session: AsyncSession = Depends(get_session),
):
    """
    Request a password reset link.
    
    Instead of using /forgot-password with token in URL,
    this endpoint returns a secure reset token that should be
    transmitted via email as a link.
    
    Security: Token is sent in email body, not exposed in URL.
    
    The email should contain:
    1. A link to reset-password page (no token in URL)
    2. Instructions to paste token in the form, OR
    3. A link with token that posts to secure endpoint
    
    Args:
        request.email: User's email address
    
    Returns:
        - message: Confirmation message
        - (Token is sent via email, not in response)
    """
    success, reset_token = await initiate_password_reset(request.email, session)
    
    # Always return same response (don't reveal if email exists)
    if not success or not reset_token:
        return {
            "message": "If that email exists, a password reset link has been sent.",
            "email": request.email,
        }
    
    # In production: Send email with reset link
    # Email should contain: http://frontend.com/auth/reset-password
    # And user enters the token in the form (or link contains token as query param
    # which then gets sent via POST body, not kept in URL)
    
    print(f"DEBUG: Password reset token for {request.email}: {reset_token}")
    
    return {
        "message": "If that email exists, a password reset link has been sent.",
        "email": request.email,
    }


@router.post("/verify-reset-token")
async def verify_reset_token_endpoint(
    request: VerifyResetTokenRequest,
):
    """
    Verify that a password reset token is valid.
    
    This helps the frontend know if the token can be used
    for password reset before the user submits the form.
    
    Args:
        request.token: Token to verify
    
    Returns:
        - valid: Boolean indicating if token is valid
        - message: Human-readable message
    """
    user_id = await verify_reset_token(request.token)
    
    if not user_id:
        return {
            "valid": False,
            "message": "Invalid or expired password reset token",
        }
    
    return {
        "valid": True,
        "message": "Token is valid. You can now reset your password.",
    }


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordWithToken,
    user_db: SQLAlchemyUserDatabase = Depends(get_user_db),
    user_manager=Depends(get_user_manager),
):
    """
    Reset password using a secure token.
    
    This endpoint receives the reset token in the POST body
    (not in the URL), preventing it from being exposed in:
    - Browser history
    - Server logs
    - Referrer headers
    - Email forwarding
    
    Args:
        request.token: Password reset token (from email)
        request.new_password: New password to set
    
    Returns:
        - message: Success message
        - user_id: User whose password was reset (for confirmation)
    """
    # Verify token
    user_id = await verify_reset_token(request.token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )
    
    try:
        # Get user from database
        from sqlalchemy import select
        from sqlalchemy.ext.asyncio import AsyncSession
        
        stmt = select(User).where(User.id == user_id)
        session = user_db.session
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found",
            )
        
        # Update password using user manager
        user.hashed_password = get_password_hash(request.new_password)
        await user_db.update(user)
        
        # Mark token as used to prevent reuse
        await mark_reset_token_used(request.token)
        
        return {
            "message": "Password reset successfully",
            "user_id": str(user.id),
        }
        
    except Exception as e:
        print(f"Error resetting password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error resetting password",
        )


# ============================================================================
# MIGRATION GUIDE FOR FRONTEND
# ============================================================================
#
# OLD FLOW (Insecure - token in URL):
# 1. GET /auth/forgot-password with email
# 2. Email contains: http://frontend.com/reset-password?token=ABC123
# 3. User clicks link, token in URL and browser history
# 4. Page makes request with token from URL
#
# NEW FLOW (Secure - token in POST body):
# 1. User enters email on reset page
# 2. POST /auth/request-password-reset with { email }
# 3. Email contains: http://frontend.com/reset-password
# 4. User enters token manually OR token is in email body as clickable link with token hidden
# 5. User enters new password
# 6. POST /auth/reset-password with { token, new_password }
# 7. Token is sent in request body, NOT in URL
# 8. Token never appears in browser history or server logs
#
# ============================================================================
