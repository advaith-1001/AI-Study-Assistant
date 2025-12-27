#!/usr/bin/env python3
"""
Migration script to create document_chunks table with pgvector support
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
    """Create the document_chunks table with pgvector embedding column"""
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is required")
    
    # Create async engine
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    try:
        async with engine.begin() as conn:
            # Enable pgvector extension if not already enabled
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                print("✓ pgvector extension enabled")
            except Exception as e:
                print(f"pgvector extension: {e}")
            
            # Create document_chunks table
            try:
                await conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS document_chunks (
                        id SERIAL PRIMARY KEY,
                        pathway_id UUID NOT NULL REFERENCES pathway(id) ON DELETE CASCADE,
                        content TEXT NOT NULL,
                        embedding vector(384)
                    )
                """))
                print("✓ Created document_chunks table")
            except Exception as e:
                print(f"document_chunks table: {e}")
            
            # Create index on pathway_id for faster queries
            try:
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_document_chunks_pathway_id 
                    ON document_chunks(pathway_id)
                """))
                print("✓ Created index on pathway_id")
            except Exception as e:
                print(f"Index creation: {e}")
            
            # Create index on embedding for vector similarity search
            try:
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_document_chunks_embedding 
                    ON document_chunks USING ivfflat (embedding vector_cosine_ops)
                    WITH (lists = 100)
                """))
                print("✓ Created vector similarity index on embedding")
            except Exception as e:
                print(f"Vector index creation: {e}")
        
        print("\n✓ Migration completed successfully!")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(apply_migration())
