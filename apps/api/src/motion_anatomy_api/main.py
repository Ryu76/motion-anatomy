from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict


class Source(BaseModel):
    title: str
    organization: str
    publication_year: int
    url: str
    license: str
    citation_text: str


class AnatomyStructure(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str
    name_ko: str
    name_en: str
    name_latin: str | None
    structure_type: Literal["bone", "muscle", "tendon", "ligament", "fascia"]
    body_region: str
    side: Literal["left", "right", "midline"]
    depth: str
    description: str
    origin_text: str | None
    insertion_text: str | None
    function_text: str
    model_node_name: str
    medical_disclaimer: str
    review_status: Literal["draft", "editor_review", "expert_review", "approved", "deprecated"]
    source: Source


class StructureList(BaseModel):
    count: int
    items: list[AnatomyStructure]


def default_seed_path() -> Path:
    return Path(__file__).resolve().parents[4] / "data" / "seed" / "anatomy_structures.json"


def load_structures(path: Path | None = None) -> list[AnatomyStructure]:
    configured_path = os.environ.get("ANATOMY_SEED_PATH")
    selected = path or (Path(configured_path) if configured_path else default_seed_path())
    raw = json.loads(selected.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError("Anatomy seed root must be an array")
    structures = [AnatomyStructure.model_validate(item) for item in raw]
    codes = [item.code for item in structures]
    if len(codes) != len(set(codes)):
        raise ValueError("Anatomy structure codes must be unique")
    return structures


def get_cors_origins() -> list[str]:
    configured = os.getenv("CORS_ALLOWED_ORIGINS")
    if not configured:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    return list(dict.fromkeys(origin.strip() for origin in configured.split(",") if origin.strip()))


app = FastAPI(title="Motion Anatomy API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Accept", "Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str | int]:
    try:
        structure_count = len(load_structures())
    except (OSError, ValueError):
        raise HTTPException(status_code=503, detail="Anatomy data is unavailable") from None
    return {"status": "ok", "service": "motion-anatomy-api", "structures": structure_count}


@app.get("/api/v1/anatomy/structures", response_model=StructureList)
def list_structures() -> StructureList:
    structures = load_structures()
    return StructureList(count=len(structures), items=structures)


@app.get("/api/v1/anatomy/structures/{code}", response_model=AnatomyStructure)
def get_structure(code: str) -> AnatomyStructure:
    structure = next((item for item in load_structures() if item.code == code), None)
    if structure is None:
        raise HTTPException(status_code=404, detail="Anatomy structure not found")
    return structure
