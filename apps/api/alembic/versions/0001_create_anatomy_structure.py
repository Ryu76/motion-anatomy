"""create anatomy structure table

Revision ID: 0001
Revises:
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "anatomy_structure",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("code", sa.String(100), nullable=False),
        sa.Column("name_ko", sa.String(200), nullable=False),
        sa.Column("name_en", sa.String(200), nullable=False),
        sa.Column("name_latin", sa.String(200)),
        sa.Column("structure_type", sa.String(30), nullable=False),
        sa.Column("body_region", sa.String(100), nullable=False),
        sa.Column("side", sa.String(20), nullable=False),
        sa.Column("depth", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("origin_text", sa.Text()),
        sa.Column("insertion_text", sa.Text()),
        sa.Column("function_text", sa.Text(), nullable=False),
        sa.Column("medical_disclaimer", sa.Text(), nullable=False),
        sa.Column("model_node_name", sa.String(200), nullable=False),
        sa.Column("review_status", sa.String(30), nullable=False, server_default="draft"),
        sa.Column("source_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_anatomy_structure_code", "anatomy_structure", ["code"], unique=True)
    op.create_index("ix_anatomy_structure_type", "anatomy_structure", ["structure_type"])
    op.create_index("ix_anatomy_structure_body_region", "anatomy_structure", ["body_region"])


def downgrade() -> None:
    op.drop_table("anatomy_structure")
