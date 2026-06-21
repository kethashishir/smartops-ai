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
    op.alter_column(
        "forecasts",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=False,
    )
    op.alter_column(
        "orders",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=False,
    )
    op.alter_column(
        "products",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=False,
    )
    op.alter_column(
        "recommendations",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=False,
    )


def downgrade() -> None:
    """Allow ownership user IDs to be nullable again."""
    op.alter_column(
        "recommendations",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=True,
    )
    op.alter_column(
        "products",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=True,
    )
    op.alter_column(
        "orders",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=True,
    )
    op.alter_column(
        "forecasts",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=True,
    )