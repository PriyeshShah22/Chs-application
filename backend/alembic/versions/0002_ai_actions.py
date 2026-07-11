"""add risk-aware assistant actions

Revision ID: 0002_ai_actions
Revises: 0001_initial
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_ai_actions"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ai_actions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("requester_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action_type", sa.String(80), nullable=False),
        sa.Column("risk", sa.String(20), nullable=False),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("payload_json", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("result_entity_type", sa.String(50)),
        sa.Column("result_entity_id", sa.Integer()),
        sa.Column("failure_code", sa.String(80)),
        sa.Column("confirmed_at", sa.DateTime()),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_ai_actions_requester_id", "ai_actions", ["requester_id"])
    op.create_index("ix_ai_actions_action_type", "ai_actions", ["action_type"])
    op.create_index("ix_ai_actions_status", "ai_actions", ["status"])
    op.create_index("ix_ai_actions_expires_at", "ai_actions", ["expires_at"])


def downgrade() -> None:
    op.drop_table("ai_actions")
