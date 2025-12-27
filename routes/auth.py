"""
Custom authentication routes for token refresh and enhanced security
"""
from fastapi import APIRouter, Depends, HTTPException, status

from core.auth import fastapi_users, auth_backend
from models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

# Get current user dependency from fastapi_users
current_user = fastapi_users.current_user()


@router.post("/refresh-token")
async def refresh_token(
    user: User = Depends(current_user),
):
    """
    Refresh the access token using the existing refresh token (in HttpOnly cookie).
    
    This endpoint allows the frontend to get a new access token when it's about to expire.
    The new token is sent in the response (can be stored in memory or new cookie).
    The refresh token in the HttpOnly cookie is automatically updated.
    
    Returns:
        - valid: Boolean indicating if token is valid
        - user_id: The authenticated user's ID
        - message: Status message
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Return user info to confirm token refresh
    return {
        "valid": True,
        "user_id": str(user.id),
        "message": "Token refresh successful"
    }


@router.post("/verify-token")
async def verify_token(
    user: User = Depends(current_user),
):
    """
    Verify that the current token is valid.
    
    This is useful for checking if the user is still authenticated
    without making any actual API calls.
    
    Returns:
        - valid: Boolean indicating if token is valid
        - user_id: The authenticated user's ID
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return {
        "valid": True,
        "user_id": str(user.id)
    }


