"""Store pre-generated complaint translations.

Revision ID: 0007_complaint_translations
Revises: 0006_visitor_notifications
"""
from alembic import op
import sqlalchemy as sa


revision = "0007_complaint_translations"
down_revision = "0006_visitor_notifications"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("complaints") as batch:
        batch.add_column(sa.Column("title_hi", sa.String(length=300), nullable=True))
        batch.add_column(sa.Column("title_mr", sa.String(length=300), nullable=True))
        batch.add_column(sa.Column("description_hi", sa.Text(), nullable=True))
        batch.add_column(sa.Column("description_mr", sa.Text(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("complaints") as batch:
        batch.drop_column("description_mr")
        batch.drop_column("description_hi")
        batch.drop_column("title_mr")
        batch.drop_column("title_hi")
