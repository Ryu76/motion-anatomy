from fastapi.testclient import TestClient

from motion_anatomy_api import main

client = TestClient(main.app)
EXPECTED_STRUCTURE_COUNT = len(main.load_structures())
EXPECTED_MUSCLE_COUNT = sum(item.structure_type == "muscle" for item in main.load_structures())


def test_health_reports_service_ready():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "motion-anatomy-api", "structures": EXPECTED_STRUCTURE_COUNT}


def test_health_reports_unavailable_when_seed_is_invalid(monkeypatch, tmp_path):
    invalid_seed = tmp_path / "invalid.json"
    invalid_seed.write_text("not-json", encoding="utf-8")
    monkeypatch.setenv("ANATOMY_SEED_PATH", str(invalid_seed))

    response = client.get("/health")
    assert response.status_code == 503
    assert response.json() == {"detail": "Anatomy data is unavailable"}


def test_lists_generated_muscles_across_all_detailed_layers():
    response = client.get("/api/v1/anatomy/structures")
    assert response.status_code == 200
    payload = response.json()
    assert payload["count"] == EXPECTED_STRUCTURE_COUNT
    assert len({item["code"] for item in payload["items"]}) == EXPECTED_STRUCTURE_COUNT
    assert sum(item["structure_type"] == "muscle" for item in payload["items"]) == EXPECTED_MUSCLE_COUNT
    assert {item["structure_type"] for item in payload["items"]} == {
        "bone", "muscle", "tendon", "ligament", "fascia", "vessel"
    }
    assert all(item["review_status"] == "draft" for item in payload["items"])


def test_returns_curated_deep_psoas_detail_by_stable_code():
    response = client.get("/api/v1/anatomy/structures/MUSCLE_PSOAS_MAJOR_L")
    assert response.status_code == 200
    item = response.json()
    assert item["name_ko"] == "왼쪽 큰허리근"
    assert item["name_en"] == "Psoas major"
    assert item["name_latin"] == "Musculus psoas major"
    assert item["search_terms"] == ["장요근"]
    assert item["depth"] == "deep"
    assert item["model_node_name"] == "MUSCLE_PSOAS_MAJOR_L"
    assert "교육용" in item["medical_disclaimer"]
    assert "Z-Anatomy" in item["source"]["license"]


def test_unknown_structure_returns_404_without_leaking_paths():
    response = client.get("/api/v1/anatomy/structures/UNKNOWN")
    assert response.status_code == 404
    assert response.json() == {"detail": "Anatomy structure not found"}


def test_configured_seed_path_does_not_evaluate_repository_default(monkeypatch):
    seed_path = main.default_seed_path()
    monkeypatch.setenv("ANATOMY_SEED_PATH", str(seed_path))

    def unexpected_default_lookup():
        raise AssertionError("repository default must not be evaluated when env is configured")

    monkeypatch.setattr(main, "default_seed_path", unexpected_default_lookup)
    assert len(main.load_structures()) == EXPECTED_STRUCTURE_COUNT
