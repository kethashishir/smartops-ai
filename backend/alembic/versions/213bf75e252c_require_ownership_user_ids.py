"""require ownership user ids

Revision ID: 213bf75e252c
Revises: 992241333c37
Create Date: 2026-06-20 18:30:32.104618

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "213bf75e252c"
down_revision: Union[str, Sequence[str], None] = "992241333c37"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Require ownership user IDs for user-scoped tables."""
    with op.batch_alter_table("forecasts") as batch_op:
        batch_op.alter_column(
            "user_id",
            existing_type=sa.INTEGER(),
            nullable=False,
        )

    with op.batch_alter_table("orders") as batch_op:
        batch_op.alter_column(
            "user_id",
            existing_type=sa.INTEGER(),
            nullable=False,
        )

    with op.batch_alter_table("products") as batch_op:
        batch_op.alter_column(
            "user_id",
            existing_type=sa.INTEGER(),
            nullable=False,
        )

    with op.batch_alter_table("recommendations") as batch_op:
        batch_op.alter_column(
            "user_id",
            existing_type=sa.INTEGER(),
            nullable=False,
        )


def downgrade() -> None:
    """Allow ownership user IDs to be nullable again."""
    with op.batch_alter_table("recommendations") as batch_op:
        batch_op.alter_column(
            "user_id",
            existing_type=sa.INTEGER(),
            nullable=True,
        )

    with op.batch_alter_table("products") as batch_op:
        batch_op.alter_column(
            "user_id",
            existing_type=sa.INTEGER(),
            nullable=True,
        )

    with op.batch_alter_table("orders") as batch_op:
        batch_op.alter_column(
            "user_id",
            existing_type=sa.INTEGER(),
            nullable=True,
        )

    with op.batch_alter_table("forecasts") as batch_op:
        batch_op.alter_column(
            "user_id",
            existing_type=sa.INTEGER(),
            nullable=True,
        )