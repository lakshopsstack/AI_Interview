"""updated test

Revision ID: 9e47c0952f70
Revises: 852e6b188f60
Create Date: 2025-07-16 15:49:54.173797

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9e47c0952f70'
down_revision: Union[str, None] = '852e6b188f60'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('edudiagno_tests', sa.Column('tech_field', sa.String(), nullable=True))
    op.drop_column('edudiagno_tests', 'department')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('edudiagno_tests', sa.Column('department', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.drop_column('edudiagno_tests', 'tech_field')
    # ### end Alembic commands ###
