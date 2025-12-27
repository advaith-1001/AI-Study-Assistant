"""
Secure password reset service with POST-based token verification
This prevents password reset tokens from being exposed in URLs/browser history
"""
from datetime import datetime, timedelta
import secrets
from sqlalchemy import select, String
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from models.user import User
import hashlib


# Password reset token configuration
RESET_TOKEN_LENGTH = 32  # Length of random token
RESET_TOKEN_EXPIRY = 3600  # Token valid for 1 hour

# Store reset tokens in memory (in production, use database)
# Format: {token_hash: {'user_id': str, 'expires': datetime}}
_reset_tokens = {}


def _hash_token(token: str) -> str:
    """Hash token for secure storage"""
    return hashlib.sha256(token.encode()).hexdigest()


async def generate_reset_token(user_id: str) -> str:
    """
    Generate a secure password reset token.
    
    Returns the unhashed token to send via email.
    The hashed token is stored internally.
    """
    # Generate random token
    token = secrets.token_urlsafe(RESET_TOKEN_LENGTH)
    token_hash = _hash_token(token)
    
    # Store token with expiry
    _reset_tokens[token_hash] = {
        'user_id': str(user_id),
        'expires': datetime.utcnow() + timedelta(seconds=RESET_TOKEN_EXPIRY),
        'used': False
    }
    
    return token


async def verify_reset_token(token: str) -> str | None:
    """
    Verify a password reset token and return the user_id if valid.
    
    Args:
        token: The unhashed token from user
    
    Returns:
        user_id if valid, None if invalid or expired
    """
    token_hash = _hash_token(token)
    
    if token_hash not in _reset_tokens:
        print(f"Reset token not found")
        return None
    
    token_data = _reset_tokens[token_hash]
    
    # Check if expired
    if datetime.utcnow() > token_data['expires']:
        print(f"Reset token expired")
        del _reset_tokens[token_hash]
        return None
    
    # Check if already used
    if token_data.get('used'):
        print(f"Reset token already used")
        del _reset_tokens[token_hash]
        return None
    
    return token_data['user_id']


async def mark_reset_token_used(token: str) -> bool:
    """
    Mark a reset token as used to prevent reuse.
    """
    token_hash = _hash_token(token)
    
    if token_hash in _reset_tokens:
        _reset_tokens[token_hash]['used'] = True
        # Clean up used token after 1 minute
        _reset_tokens[token_hash]['cleanup_time'] = datetime.utcnow() + timedelta(seconds=60)
        return True
    
    return False


async def cleanup_expired_tokens():
    """
    Cleanup expired and used tokens (should be called periodically).
    """
    now = datetime.utcnow()
    expired_tokens = [
        token_hash for token_hash, data in _reset_tokens.items()
        if now > data['expires'] or (data.get('cleanup_time') and now > data['cleanup_time'])
    ]
    
    for token_hash in expired_tokens:
        del _reset_tokens[token_hash]
    
    return len(expired_tokens)


async def initiate_password_reset(
    user_email: str,
    user_db: AsyncSession,
) -> tuple[bool, str | None]:
    """
    Initiate password reset flow for a user.
    
    Args:
        user_email: Email of user requesting reset
        user_db: Database session
    
    Returns:
        (success: bool, reset_token: str | None)
    """
    try:
        # Find user by email
        stmt = select(User).where(User.email == user_email)
        result = await user_db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            # Don't reveal if user exists (security best practice)
            print(f"Password reset requested for non-existent email: {user_email}")
            return False, None
        
        # Generate reset token
        reset_token = await generate_reset_token(str(user.id))
        
        return True, reset_token
        
    except Exception as e:
        print(f"Error initiating password reset: {e}")
        return False, None


# Note: The email link should now be:
# Instead of: http://localhost:3000/auth/reset-password?token=ABC123
# Use: http://localhost:3000/auth/reset-password
# (without token in URL)
# 
# The reset page should:
# 1. Show form asking for email address
# 2. User enters email and clicks "Send Reset Link"
# 3. Backend generates token and sends via email with link to reset page
# 4. Reset page makes POST request with token in body (not URL)
# 5. Backend verifies token and allows password reset
