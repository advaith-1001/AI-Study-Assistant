"""Add document_chunks table for pgvector embeddings

Revision ID: 002
Revises: 001
Create Date: 2025-12-26 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create document_chunks table with pgvector column
    op.create_table(
        'document_chunks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('pathway_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('embedding', Vector(384), nullable=True),
        sa.ForeignKeyConstraint(['pathway_id'], ['pathway.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_chunks_pathway_id'), 'document_chunks', ['pathway_id'], unique=False)


def downgrade() -> None:
    # Drop the document_chunks table
    op.drop_index(op.f('ix_document_chunks_pathway_id'), table_name='document_chunks')
    op.drop_table('document_chunks')
