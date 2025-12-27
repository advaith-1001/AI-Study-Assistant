"""Add token persistence fields to oauth_account

Revision ID: 001
Revises: 
Create Date: 2025-12-26 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to oauth_account table
    op.add_column('oauth_account', sa.Column('refresh_token', sa.Text(), nullable=True))
    op.add_column('oauth_account', sa.Column('token_expiration', sa.DateTime(), nullable=True))
    op.add_column('oauth_account', sa.Column('last_refreshed', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Drop the columns if rolling back
    op.drop_column('oauth_account', 'last_refreshed')
    op.drop_column('oauth_account', 'token_expiration')
    op.drop_column('oauth_account', 'refresh_token')
