from motion_anatomy_api.db import Base


def test_anatomy_structure_table_contract():
    table = Base.metadata.tables["anatomy_structure"]
    assert table.primary_key.columns.keys() == ["id"]
    assert {
        "code",
        "name_ko",
        "name_en",
        "structure_type",
        "body_region",
        "side",
        "description",
        "review_status",
        "source_json",
    }.issubset(table.columns.keys())
    assert table.c.code.unique is True
    assert table.c.code.nullable is False
