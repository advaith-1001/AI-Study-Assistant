#!/usr/bin/env python3
"""
Simple migration script to add token persistence fields to oauth_account table
"""
import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def apply_migration():
    """Apply the migration to add token persistence columns"""
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is required")
    
    # Create async engine
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    # Create async session
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    try:
        async with async_session() as session:
            # Check if columns already exist
            async with engine.begin() as conn:
                # Try to add refresh_token column
                try:
                    await conn.execute(text("""
                        ALTER TABLE oauth_account 
                        ADD COLUMN IF NOT EXISTS refresh_token TEXT
                    """))
                    print("✓ Added refresh_token column")
                except Exception as e:
                    print(f"refresh_token column: {e}")
                
                # Try to add token_expiration column
                try:
                    await conn.execute(text("""
                        ALTER TABLE oauth_account 
                        ADD COLUMN IF NOT EXISTS token_expiration TIMESTAMP
                    """))
                    print("✓ Added token_expiration column")
                except Exception as e:
                    print(f"token_expiration column: {e}")
                
                # Try to add last_refreshed column
                try:
                    await conn.execute(text("""
                        ALTER TABLE oauth_account 
                        ADD COLUMN IF NOT EXISTS last_refreshed TIMESTAMP
                    """))
                    print("✓ Added last_refreshed column")
                except Exception as e:
                    print(f"last_refreshed column: {e}")
        
        print("\n✓ Migration completed successfully!")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(apply_migration())
