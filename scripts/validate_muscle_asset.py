"""Validate the generated muscle GLB against its source-derived manifest and seed mapping.

Run with Blender because the emitted asset uses Draco compression:
  blender --background --python scripts/validate_muscle_asset.py -- \
    apps/web/public/models/z-anatomy/z-anatomy-muscles-detailed.glb \
    data/generated/z-anatomy-muscles-manifest.json data/seed/anatomy_structures.json
"""

import bpy
import hashlib
import json
import sys
from pathlib import Path

args = sys.argv[sys.argv.index("--") + 1:]
asset_path, manifest_path, seed_path = (Path(value).resolve() for value in args)
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
seeds = json.loads(seed_path.read_text(encoding="utf-8"))
expected_nodes = set(manifest["node_names"])
muscle_seeds = [item for item in seeds if item["structure_type"] == "muscle"]
seed_nodes = [item["model_node_name"] for item in muscle_seeds]
seed_codes = [item["code"] for item in muscle_seeds]

assert manifest["asset_sha256"] == hashlib.sha256(asset_path.read_bytes()).hexdigest(), "GLB checksum differs from manifest"
assert manifest["asset_bytes"] == asset_path.stat().st_size, "GLB byte size differs from manifest"
assert len(expected_nodes) == manifest["muscle_count"] == len(manifest["muscles"]), "Manifest node count is not unique"
assert "MUSCLE_SYSTEM_STATIC" not in expected_nodes, "Merged static node is forbidden"
assert len(seed_nodes) == len(set(seed_nodes)) == len(seed_codes) == len(set(seed_codes)), "Muscle seed IDs/nodes must be unique"
assert set(seed_nodes) == expected_nodes, "Seed and manifest nodes must map one-to-one"
assert all(item["vertices"] > 0 and item["triangles"] > 0 for item in manifest["muscles"]), "Manifest includes geometry-free muscle"
for required in ("MUSCLE_PSOAS_MAJOR_L", "MUSCLE_PSOAS_MAJOR_R", "MUSCLE_ILIACUS_MUSCLE_L", "MUSCLE_ILIACUS_MUSCLE_R"):
    assert required in expected_nodes, f"Missing iliopsoas component {required}"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(asset_path))
meshes = {obj.name: obj for obj in bpy.context.scene.objects if obj.type == "MESH"}
assert "MUSCLE_SYSTEM_STATIC" not in meshes, "GLB includes deprecated merged static mesh"
assert set(meshes) == expected_nodes, (
    f"GLB node contract mismatch: expected={len(expected_nodes)} actual={len(meshes)} "
    f"missing={sorted(expected_nodes - set(meshes))[:10]} extra={sorted(set(meshes) - expected_nodes)[:10]}"
)
for node_name, mesh in meshes.items():
    assert len(mesh.data.vertices) > 0 and len(mesh.data.polygons) > 0, f"GLB node has no geometry: {node_name}"

morph_nodes = {name for name, mesh in meshes.items() if mesh.data.shape_keys}
expected_morph_nodes = {"MUSCLE_GLUTEUS_MAXIMUS_L", "MUSCLE_GLUTEUS_MAXIMUS_R", "MUSCLE_RECTUS_FEMORIS_L", "MUSCLE_RECTUS_FEMORIS_R"}
assert morph_nodes == expected_morph_nodes, f"Morph targets changed: {sorted(morph_nodes)}"
print(f"MUSCLE_ASSET_VALID nodes={len(meshes)} seed_muscles={len(muscle_seeds)} morph_nodes={len(morph_nodes)} bytes={asset_path.stat().st_size}", flush=True)
