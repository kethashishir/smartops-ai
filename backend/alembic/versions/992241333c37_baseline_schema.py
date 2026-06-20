"""baseline schema

Revision ID: 992241333c37
Revises:
Create Date: 2026-06-20 16:31:11.489402

"""
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "992241333c37"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Baseline existing schema.

    This project introduced Alembic after the local development database
    already contained the current tables and indexes. The current database
    will be stamped to this revision instead of replaying table creation.
    """
    pass


def downgrade() -> None:
    """No-op baseline downgrade."""
    pass