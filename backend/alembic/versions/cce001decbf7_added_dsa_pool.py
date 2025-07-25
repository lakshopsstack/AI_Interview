"""added dsa pool

Revision ID: cce001decbf7
Revises: dfee08a99018
Create Date: 2025-07-03 11:25:15.710269

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cce001decbf7'
down_revision: Union[str, None] = 'dfee08a99018'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('dsa_pool_questions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('topic', sa.String(), nullable=True),
    sa.Column('difficulty', sa.String(), nullable=True),
    sa.Column('time_minutes', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('dsa_pool_test_cases',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('input', sa.String(), nullable=False),
    sa.Column('expected_output', sa.String(), nullable=False),
    sa.Column('dsa_pool_question_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['dsa_pool_question_id'], ['dsa_pool_questions.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('dsa_pool_test_cases')
    op.drop_table('dsa_pool_questions')
    # ### end Alembic commands ###
