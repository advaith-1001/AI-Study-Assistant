"""
OAuth token management service for handling refresh tokens and expiration
"""
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User, OAuthAccount
import httpx


async def persist_oauth_token(
    user_db: AsyncSession,
    user_id: str,
    account_id: str,
    access_token: str,
    refresh_token: str | None = None,
    expires_in: int | None = None,
):
    """
    Persist OAuth tokens to database for later refresh.
    
    Args:
        user_db: Database session
        user_id: User ID
        account_id: OAuth provider account ID
        access_token: OAuth access token
        refresh_token: OAuth refresh token (if provided)
        expires_in: Token expiration time in seconds
    """
    try:
        # Find the OAuthAccount
        stmt = select(OAuthAccount).where(
            OAuthAccount.user_id == user_id,
            OAuthAccount.account_id == account_id
        )
        result = await user_db.execute(stmt)
        oauth_account = result.scalar_one_or_none()
        
        if oauth_account:
            # Update existing account with new tokens
            oauth_account.access_token = access_token
            if refresh_token:
                oauth_account.refresh_token = refresh_token
            
            # Calculate token expiration if provided
            if expires_in:
                oauth_account.token_expiration = datetime.utcnow() + timedelta(seconds=expires_in)
            
            oauth_account.last_refreshed = datetime.utcnow()
            
            await user_db.commit()
            return True
    except Exception as e:
        print(f"Error persisting OAuth token: {e}")
        return False


async def should_refresh_oauth_token(
    oauth_account: OAuthAccount,
    buffer_seconds: int = 300  # Refresh 5 minutes before expiry
) -> bool:
    """
    Check if OAuth token needs refresh.
    
    Args:
        oauth_account: OAuthAccount instance
        buffer_seconds: Seconds before expiry to trigger refresh
    
    Returns:
        True if token should be refreshed
    """
    if not oauth_account.token_expiration:
        return False
    
    now = datetime.utcnow()
    refresh_time = oauth_account.token_expiration - timedelta(seconds=buffer_seconds)
    
    return now >= refresh_time


async def refresh_oauth_token(
    user_db: AsyncSession,
    oauth_account: OAuthAccount,
    oauth_client,
) -> bool:
    """
    Refresh OAuth token using refresh token.
    
    Args:
        user_db: Database session
        oauth_account: OAuthAccount instance
        oauth_client: OAuth client (e.g., GoogleOAuth2)
    
    Returns:
        True if refresh was successful
    """
    if not oauth_account.refresh_token:
        print(f"No refresh token available for {oauth_account.account_id}")
        return False
    
    try:
        # Refresh token using OAuth client
        # This is an example for Google OAuth2
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": oauth_client.client_id,
                    "client_secret": oauth_client.client_secret,
                    "refresh_token": oauth_account.refresh_token,
                    "grant_type": "refresh_token",
                },
            )
            
            if response.status_code == 200:
                data = response.json()
                oauth_account.access_token = data.get("access_token")
                
                if "expires_in" in data:
                    oauth_account.token_expiration = datetime.utcnow() + timedelta(
                        seconds=data["expires_in"]
                    )
                
                # Some OAuth providers return a new refresh token
                if "refresh_token" in data:
                    oauth_account.refresh_token = data["refresh_token"]
                
                oauth_account.last_refreshed = datetime.utcnow()
                await user_db.commit()
                print(f"Successfully refreshed OAuth token for {oauth_account.account_id}")
                return True
            else:
                print(f"Failed to refresh OAuth token: {response.text}")
                return False
                
    except Exception as e:
        print(f"Error refreshing OAuth token: {e}")
        return False


async def get_valid_oauth_token(
    user_db: AsyncSession,
    oauth_account: OAuthAccount,
    oauth_client,
) -> str | None:
    """
    Get a valid OAuth token, refreshing if necessary.
    
    Args:
        user_db: Database session
        oauth_account: OAuthAccount instance
        oauth_client: OAuth client
    
    Returns:
        Valid access token or None if refresh fails
    """
    # Check if token needs refresh
    if await should_refresh_oauth_token(oauth_account):
        success = await refresh_oauth_token(user_db, oauth_account, oauth_client)
        if not success:
            return None
    
    return oauth_account.access_token
