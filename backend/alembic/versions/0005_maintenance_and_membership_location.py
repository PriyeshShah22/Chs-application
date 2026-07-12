"""single maintenance charge and membership location

Revision ID: 0005_maintenance_location
Revises: 0004_workflows_billing_roles
"""
from alembic import op
import sqlalchemy as sa

revision = "0005_maintenance_location"
down_revision = "0004_workflows_billing_roles"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("join_requests") as batch:
        batch.add_column(sa.Column("building_name", sa.String(100), nullable=False, server_default="Unknown"))
        batch.add_column(sa.Column("flat_number", sa.String(50), nullable=False, server_default="Unknown"))
    with op.batch_alter_table("payment_attempts") as batch:
        batch.add_column(sa.Column("bill_ids_json", sa.Text(), nullable=True))
    connection = op.get_bind()
    for (bill_id, total) in connection.execute(sa.text("SELECT id, total_amount FROM bills")).all():
        connection.execute(sa.text("DELETE FROM bill_line_items WHERE bill_id=:id"), {"id": bill_id})
        connection.execute(sa.text("INSERT INTO bill_line_items (bill_id, code, label, amount) VALUES (:id, 'maintenance', 'Monthly Maintenance', :amount)"), {"id": bill_id, "amount": total})
    connection.execute(sa.text("UPDATE bills SET description='Monthly society maintenance charge'"))


def downgrade() -> None:
    with op.batch_alter_table("payment_attempts") as batch:
        batch.drop_column("bill_ids_json")
    with op.batch_alter_table("join_requests") as batch:
        batch.drop_column("flat_number")
        batch.drop_column("building_name")
