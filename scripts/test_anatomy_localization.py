"""Regression tests for Korean primary-name localization.

Run from the repository root:
  python -m unittest scripts.test_anatomy_localization
"""
import json
import re
import unittest
from pathlib import Path

from scripts.anatomy_localization import EXACT_SOURCE_NAMES, korean_anatomical_name, source_base_name

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "data/generated/z-anatomy-muscles-manifest.json"
SEED_PATH = ROOT / "data/seed/anatomy_structures.json"

EXACT_NAMES = {
    "(Abdominal part of pectoralis major muscle)_L": "왼쪽 큰가슴근 복부",
    "Ascending part of trapezius muscle_R": "오른쪽 등세모근 상행부",
    "Descending part of trapezius muscle_L": "왼쪽 등세모근 하행부",
    "Extensor pollicis longus_L": "왼쪽 긴엄지폄근",
    "Flexor hallucis longus_R": "오른쪽 긴엄지발가락굽힘근",
    "Iliocostalis colli muscle": "목엉덩갈비근",
    "Interspinales thoracis muscles_R": "오른쪽 가슴가시사이근",
    "Longissimus colli muscle_L": "왼쪽 목최장근",
    "Mentalis muscle_R": "오른쪽 턱끝근",
    "Omohyoid muscle_L": "왼쪽 어깨목뿔근",
    "Plantar interossei muscles_R": "오른쪽 발바닥뼈사이근",
    "Rectus abdominis muscle_L": "왼쪽 배곧은근",
    "Splenius colli muscle_L": "왼쪽 목널판근",
    "Superior head of lateral pterygoid muscle_R": "오른쪽 가쪽날개근 위갈래",
    "Transverse arytenoid muscle": "가로모뿔연골근",
}


def source_name_from_expectation(key: str) -> tuple[str, str]:
    match = re.search(r"_(L|R)$", key)
    if not match:
        return key, "midline"
    side = {"L": "left", "R": "right"}[match.group(1)]
    return f"{key[:-2]}.{match.group(1).lower()}", side


class KoreanAnatomicalNameTests(unittest.TestCase):
    def test_exact_clinical_vocabulary(self) -> None:
        for key, expected in EXACT_NAMES.items():
            with self.subTest(source=key):
                source_name, side = source_name_from_expectation(key)
                self.assertEqual(korean_anatomical_name(source_name, side), expected)

    def test_every_manifest_source_localizes_to_korean_without_ascii(self) -> None:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        self.assertEqual(manifest["muscle_count"], 462)
        names = [
            korean_anatomical_name(item["source_name"], {".l": "left", ".r": "right"}.get(item["source_name"].lower()[-2:], "midline"))
            for item in manifest["muscles"]
        ]
        self.assertEqual(len(names), 462)
        self.assertTrue(all(re.search(r"[가-힣]", name) for name in names))
        self.assertTrue(all(not re.search(r"[A-Za-z]", name) for name in names))
        for bad in ("아스크에느드이느그", "르오느그", "므우스"):
            self.assertTrue(all(bad not in name for name in names), bad)

    def test_manifest_vocabulary_has_explicit_curated_terms(self) -> None:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        missing = sorted({source_base_name(item["source_name"]).replace("(", "").replace(")", "").strip() for item in manifest["muscles"]} - set(EXACT_SOURCE_NAMES))
        self.assertEqual(missing, [])

    def test_regenerated_seed_primary_names_match_localizer_and_preserve_source(self) -> None:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        seed = json.loads(SEED_PATH.read_text(encoding="utf-8"))
        muscles = {item["model_node_name"]: item for item in seed if item["structure_type"] == "muscle"}
        self.assertEqual(len(muscles), 462)
        for item in manifest["muscles"]:
            with self.subTest(node=item["model_node_name"]):
                record = muscles[item["model_node_name"]]
                self.assertEqual(record["name_en"], source_base_name(item["source_name"]))
                self.assertEqual(record["name_ko"], korean_anatomical_name(item["source_name"], record["side"]))
                self.assertEqual(record["source"]["citation_text"], f"Source object: {item['source_name']}; SHA-256: {manifest['source']['sha256']}")
                self.assertRegex(record["name_ko"], r"[가-힣]")
                self.assertNotRegex(record["name_ko"], r"[A-Za-z]")


if __name__ == "__main__":
    unittest.main()
