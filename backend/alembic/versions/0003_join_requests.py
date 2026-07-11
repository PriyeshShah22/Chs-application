"""add reviewed join requests

Revision ID: 0003_join_requests
Revises: 0002_ai_actions
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_join_requests"
down_revision = "0002_ai_actions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "join_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("full_name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("phone", sa.String(20)),
        sa.Column("date_of_birth", sa.Date(), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("society_id", sa.Integer(), sa.ForeignKey("societies.id", ondelete="SET NULL")),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("reviewer_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("reviewed_at", sa.DateTime()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_join_requests_email", "join_requests", ["email"])
    op.create_index("ix_join_requests_society_id", "join_requests", ["society_id"])
    op.create_index("ix_join_requests_status", "join_requests", ["status"])
    op.create_index("ix_join_requests_created_at", "join_requests", ["created_at"])


def downgrade() -> None:
    op.drop_table("join_requests")
