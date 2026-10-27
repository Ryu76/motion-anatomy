"""Build Z-Anatomy system layers and an individually selectable muscle GLB.

Usage:
  blender --background --python scripts/build_anatomy_layers.py -- \
    .asset-src apps/web/public/models/z-anatomy \
    data/generated/z-anatomy-muscles-manifest.json \
    data/seed/anatomy_structures.json

Append ``--seed-only`` to regenerate localized seed records without touching any GLB.

The muscle export deliberately retains one mesh object for every source object that
has non-tendon/non-fascia muscle faces.  Only the four named animation targets get
morphs; the remaining source geometry stays static and individually selectable.
"""

import bmesh
import bpy
import hashlib
import json
import math
import re
import sys
import zlib
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from anatomy_localization import korean_anatomical_name, korean_unreviewed_description, korean_unreviewed_function

args = sys.argv[sys.argv.index("--") + 1:]
seed_only = "--seed-only" in args
args = [value for value in args if value != "--seed-only"]
if len(args) < 2:
    raise RuntimeError("Expected source and target directories")
source_dir = Path(args[0]).resolve()
target_dir = Path(args[1]).resolve()
manifest_path = Path(args[2]).resolve() if len(args) > 2 else Path("data/generated/z-anatomy-muscles-manifest.json").resolve()
seed_path = Path(args[3]).resolve() if len(args) > 3 else Path("data/seed/anatomy_structures.json").resolve()
target_dir.mkdir(parents=True, exist_ok=True)
manifest_path.parent.mkdir(parents=True, exist_ok=True)

MUSCLE_EXCLUDED = {"<none>", "Tendon", "Fascia", "Ligament.001", "Bursa", "Cartilage.001", "Articular capsule.001"}
VASCULAR_MATERIALS = {"Artery", "Vein", "Pulmonary artery", "Pulmonary vein"}
JOINT_MATERIALS = {"Ligament", "Cartilage", "Articular capsule", "Suture-1", "Fat"}
TARGET_MUSCLES = {
    "Gluteus maximus muscle.l": "MUSCLE_GLUTEUS_MAXIMUS_L",
    "Gluteus maximus muscle.r": "MUSCLE_GLUTEUS_MAXIMUS_R",
    "Rectus femoris muscle.l": "MUSCLE_RECTUS_FEMORIS_L",
    "Rectus femoris muscle.r": "MUSCLE_RECTUS_FEMORIS_R",
}
SOURCE_URL = "https://github.com/LluisV/Z-Anatomy/blob/PC-Version/Resources/Models/FBX/MuscularSystem100.fbx"
SOURCE_LICENSE = "BodyParts3D CC BY-SA 2.1 Japan; Z-Anatomy CC BY-SA 4.0"
DISCLAIMER = "표시되는 정보와 활성도는 교육용 상대 표현이며 의료 진단이나 치료를 대체하지 않습니다."

# Curated terms supplement the deterministic Korean localization module.  The
# generated primary name is always Korean; ``name_en`` retains the source name.
CURATED_NAMES = {
    "Psoas major.l": ("왼쪽 큰허리근", "Psoas major", "Musculus psoas major", "deep"),
    "Psoas major.r": ("오른쪽 큰허리근", "Psoas major", "Musculus psoas major", "deep"),
    "Iliacus muscle.l": ("왼쪽 엉덩근", "Iliacus", "Musculus iliacus", "deep"),
    "Iliacus muscle.r": ("오른쪽 엉덩근", "Iliacus", "Musculus iliacus", "deep"),
    "Gluteus maximus muscle.l": ("왼쪽 대둔근", "Gluteus maximus", "Musculus gluteus maximus", "superficial"),
    "Gluteus maximus muscle.r": ("오른쪽 대둔근", "Gluteus maximus", "Musculus gluteus maximus", "superficial"),
    "Rectus femoris muscle.l": ("왼쪽 대퇴직근", "Rectus femoris", "Musculus rectus femoris", "superficial"),
    "Rectus femoris muscle.r": ("오른쪽 대퇴직근", "Rectus femoris", "Musculus rectus femoris", "superficial"),
}

# Search terms may identify a clinically useful anatomical group, but they must
# not replace a mesh-backed component's canonical display name. Each alias is
# repeated for every real component that belongs to the group so a search result
# remains directly selectable and isolatable.
CURATED_SEARCH_TERMS = {
    "Psoas major.l": ("장요근",),
    "Psoas major.r": ("장요근",),
    "Iliacus muscle.l": ("장요근",),
    "Iliacus muscle.r": ("장요근",),
}


def reset_and_import(path: Path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=str(path), use_anim=False)
    return [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]


def material_name(obj, index):
    if index >= len(obj.material_slots) or not obj.material_slots[index].material:
        return "<none>"
    return obj.material_slots[index].material.name


def extract_faces(source, predicate, name):
    world = source.matrix_world.copy()
    result = source.copy()
    result.data = source.data.copy()
    result.animation_data_clear()
    bpy.context.collection.objects.link(result)
    result.parent = None
    result.matrix_world = world
    mesh = bmesh.new()
    mesh.from_mesh(result.data)
    remove = [face for face in mesh.faces if not predicate(material_name(source, face.material_index))]
    bmesh.ops.delete(mesh, geom=remove, context="FACES")
    mesh.to_mesh(result.data)
    mesh.free()
    result.data.update()
    if not result.data.polygons or not result.data.vertices:
        bpy.data.objects.remove(result, do_unlink=True)
        return None
    result.name = name
    for polygon in result.data.polygons:
        polygon.use_smooth = True
    return result


def decimate(obj, ratio):
    if ratio >= 0.999 or len(obj.data.polygons) < 32:
        return
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    modifier = obj.modifiers.new(name="Web decimation", type="DECIMATE")
    modifier.ratio = ratio
    modifier.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def join_objects(objects, name):
    objects = [obj for obj in objects if obj and obj.name in bpy.context.scene.objects]
    if not objects:
        raise RuntimeError(f"No objects for {name}")
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    joined = bpy.context.active_object
    joined.name = name
    return joined


def add_muscle_morphs(obj):
    if obj.data.shape_keys:
        return
    basis = obj.shape_key_add(name="Basis")
    shorten = obj.shape_key_add(name="Shorten")
    lengthen = obj.shape_key_add(name="Lengthen")
    coords = [point.co.copy() for point in basis.data]
    axis, radial = 2, (0, 1)
    low, high = min(point[axis] for point in coords), max(point[axis] for point in coords)
    center, span = (low + high) / 2, max(high - low, 1e-6)
    radial_center = [sum(point[i] for point in coords) / len(coords) for i in radial]
    for index, point in enumerate(coords):
        t = (point[axis] - low) / span
        belly = math.sin(math.pi * t) ** 2
        shorten.data[index].co[axis] = point[axis] + (center - point[axis]) * 0.22 * belly
        lengthen.data[index].co[axis] = point[axis] - (center - point[axis]) * 0.16 * belly
        for radial_index, radial_axis in enumerate(radial):
            offset = point[radial_axis] - radial_center[radial_index]
            shorten.data[index].co[radial_axis] = radial_center[radial_index] + offset * (1 + 0.16 * belly)
            lengthen.data[index].co[radial_axis] = radial_center[radial_index] + offset * (1 - 0.07 * belly)
    print(f"MORPH target={obj.name} vertices={len(coords)} axis={axis} span={span:.4f}")


def export_selected(objects, filename):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    target = target_dir / filename
    bpy.ops.export_scene.gltf(
        filepath=str(target), export_format="GLB", use_selection=True, export_apply=True,
        export_yup=True, export_materials="EXPORT", export_morph=True, export_morph_normal=True,
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=8,
        export_draco_position_quantization=14, export_draco_normal_quantization=10,
    )
    triangles = sum(sum(max(1, len(poly.vertices) - 2) for poly in obj.data.polygons) for obj in objects)
    print(f"LAYER_EXPORT file={filename} objects={len(objects)} triangles={triangles} bytes={target.stat().st_size}")
    return target


def source_side(name):
    if re.search(r"(?:[._ -])l$", name, flags=re.I):
        return "left"
    if re.search(r"(?:[._ -])r$", name, flags=re.I):
        return "right"
    return "midline"


def source_base_name(name):
    return re.sub(r"(?:[._ -])[lr]$", "", name, flags=re.I).strip()


def source_code(name, used_codes):
    side = source_side(name)
    normalized = source_base_name(name).upper().replace("&", " AND ")
    normalized = re.sub(r"[^A-Z0-9]+", "_", normalized).strip("_")
    side_suffix = {"left": "_L", "right": "_R"}.get(side, "")
    code = f"MUSCLE_{normalized}{side_suffix}"
    # Blender's exported node identifiers are capped at 63 characters.  Preserve a
    # readable prefix plus side and a deterministic source-name checksum instead of
    # letting Blender silently truncate nodes into collisions.
    if len(code) > 63:
        digest = f"{zlib.crc32(name.encode('utf-8')) & 0xffffffff:08X}"
        readable_length = 63 - len("MUSCLE_") - len(side_suffix) - len(digest) - 1
        code = f"MUSCLE_{normalized[:readable_length]}{side_suffix}_{digest}"
    # FBX labels are not guaranteed unique after normalization.  This deterministic
    # suffix retains stability without silently merging source meshes.
    if code in used_codes:
        code = f"{code[:54]}_{zlib.crc32(name.encode('utf-8')) & 0xffffffff:08X}"
    if code in used_codes or len(code) > 63:
        raise RuntimeError(f"Unable to create a unique Blender-safe code for {name}")
    return code


def body_region(name):
    value = name.lower()
    groups = {
        "head": ("facial", "ocular", "eye", "tongue", "temporal", "masseter", "occipital", "auricular"),
        "neck": ("cerv", "hyoid", "scalen", "sternocleid", "longus colli", "longus capitis"),
        "thorax": ("intercost", "thorac", "pectoral", "serratus", "diaphragm"),
        "abdomen": ("abdomin", "oblique", "transvers", "quadratus lumborum", "psoas", "iliacus"),
        "back": ("trapezi", "latiss", "rhomboid", "erector", "multifid", "splenius", "semispinal", "rotator"),
        "upper_limb": ("arm", "brachi", "deltoid", "forearm", "carpi", "digitorum", "pronator", "supinator", "hand", "thenar", "hypothenar"),
        "pelvis": ("glute", "piriform", "gemell", "obturator", "femoris", "iliotibial", "tensor fasciae"),
        "lower_limb": ("femoral", "thigh", "patella", "tibial", "fibular", "gastrocn", "soleus", "plantar", "foot", "hallucis", "poplite", "leg", "ankle"),
    }
    for region, needles in groups.items():
        if any(needle in value for needle in needles):
            return region
    return "whole_body"


def seed_record(entry, source_sha256):
    source_name = entry["source_name"]
    curated = CURATED_NAMES.get(source_name)
    # The source-object label remains the explicit English reference name.  The
    # Korean display name always comes from the deterministic localizer, even
    # for the small curated metadata set.
    name_ko = korean_anatomical_name(source_name, source_side(source_name))
    name_en = source_base_name(source_name)
    name_latin = curated[2] if curated else None
    depth = curated[3] if curated else "source-classified"
    search_terms = CURATED_SEARCH_TERMS.get(source_name, ())
    record = {
        "code": entry["model_node_name"], "name_ko": name_ko, "name_en": name_en,
        "name_latin": name_latin, "structure_type": "muscle", "body_region": body_region(source_name),
        "side": source_side(source_name), "depth": depth,
        "description": korean_unreviewed_description(),
        "origin_text": None, "insertion_text": None,
        "function_text": korean_unreviewed_function(),
        "model_node_name": entry["model_node_name"], "medical_disclaimer": DISCLAIMER,
        "review_status": "draft",
        "source": {
            "title": "Z-Anatomy MuscularSystem100", "organization": "Z-Anatomy / BodyParts3D",
            "publication_year": 2026, "url": SOURCE_URL, "license": SOURCE_LICENSE,
            "citation_text": f"Source object: {source_name}; SHA-256: {source_sha256}",
        },
    }
    if search_terms:
        record["search_terms"] = list(search_terms)
    return record


def regenerate_seed_from_manifest():
    """Rebuild only source-backed muscle seed records from the stable manifest.

    This path never imports or exports a scene, so a localization-only rebuild
    cannot replace or mutate the checked muscle GLB.
    """
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    entries = manifest["muscles"]
    if manifest["muscle_count"] != len(entries):
        raise RuntimeError("Manifest muscle count does not match entries")
    existing = json.loads(seed_path.read_text(encoding="utf-8")) if seed_path.exists() else []
    retained = [item for item in existing if item.get("structure_type") != "muscle"]
    seeds = retained + [seed_record(item, manifest["source"]["sha256"]) for item in entries]
    seed_path.write_text(json.dumps(seeds, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    node_map_path = seed_path.with_name("model-node-map.json")
    node_map = {item["model_node_name"]: item["code"] for item in seeds if item["structure_type"] == "muscle"}
    node_map_path.write_text(json.dumps(dict(sorted(node_map.items())), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"MUSCLE_SEED_REGENERATED path={seed_path} muscles={len(entries)}", flush=True)


def build_muscular_layer():
    source_file = source_dir / "MuscularSystem100.fbx"
    if not source_file.exists():
        raise FileNotFoundError(f"Missing {source_file}")
    source_sha256 = hashlib.sha256(source_file.read_bytes()).hexdigest()
    sources = reset_and_import(source_file)
    used_codes, muscles, manifest_entries = set(), [], []
    for source in sorted(sources, key=lambda item: item.name.casefold()):
        code = TARGET_MUSCLES.get(source.name) or source_code(source.name, used_codes)
        if code in used_codes:
            raise RuntimeError(f"Duplicate fixed muscle code {code}")
        used_codes.add(code)
        muscle = extract_faces(source, lambda material: material not in MUSCLE_EXCLUDED, code)
        if not muscle:
            used_codes.remove(code)
            continue
        is_target = source.name in TARGET_MUSCLES
        decimate(muscle, 0.68 if is_target else 0.30)
        if not muscle.data.vertices or not muscle.data.polygons:
            raise RuntimeError(f"Muscle mesh lost geometry after optimization: {source.name}")
        if is_target:
            add_muscle_morphs(muscle)
        triangles = sum(max(1, len(poly.vertices) - 2) for poly in muscle.data.polygons)
        manifest_entries.append({
            "source_name": source.name, "model_node_name": code, "vertices": len(muscle.data.vertices),
            "polygons": len(muscle.data.polygons), "triangles": triangles,
            "morph_targets": [key.name for key in muscle.data.shape_keys.key_blocks] if muscle.data.shape_keys else [],
        })
        muscles.append(muscle)
    if not muscles:
        raise RuntimeError("No material-face-classified muscle meshes were produced")
    muscle_glb = export_selected(muscles, "z-anatomy-muscles-detailed.glb")
    manifest_entries.sort(key=lambda item: item["model_node_name"])
    node_names = [item["model_node_name"] for item in manifest_entries]
    manifest = {
        "asset": muscle_glb.name, "asset_bytes": muscle_glb.stat().st_size,
        "asset_sha256": hashlib.sha256(muscle_glb.read_bytes()).hexdigest(),
        "source": {"file": source_file.name, "url": SOURCE_URL, "sha256": source_sha256, "bytes": source_file.stat().st_size, "license": SOURCE_LICENSE},
        "muscle_count": len(manifest_entries), "node_names": node_names, "muscles": manifest_entries,
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    existing = json.loads(seed_path.read_text(encoding="utf-8")) if seed_path.exists() else []
    retained = [item for item in existing if item.get("structure_type") != "muscle"]
    seeds = retained + [seed_record(item, source_sha256) for item in manifest_entries]
    seed_path.write_text(json.dumps(seeds, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    node_map_path = seed_path.with_name("model-node-map.json")
    node_map = {item["model_node_name"]: item["code"] for item in seeds if item["structure_type"] == "muscle"}
    node_map_path.write_text(json.dumps(dict(sorted(node_map.items())), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"MUSCLE_MANIFEST path={manifest_path} muscles={len(manifest_entries)} sha256={manifest['asset_sha256']}")
    return muscles


def build_single_layer(source_file, accepted_materials, object_name, filename, ratio):
    path = source_dir / source_file
    if not path.exists():
        print(f"LAYER_SKIP missing_source={source_file}")
        return
    sources = reset_and_import(path)
    parts = []
    for index, source in enumerate(sources):
        part = extract_faces(source, accepted_materials.__contains__, f"part-{index}")
        if part:
            decimate(part, ratio)
            parts.append(part)
    if parts:
        export_selected([join_objects(parts, object_name)], filename)


if seed_only:
    regenerate_seed_from_manifest()
    print("ANATOMY_SEED_BUILD_COMPLETE")
else:
    build_muscular_layer()
    build_single_layer("Joints100.fbx", JOINT_MATERIALS, "LIGAMENT_CARTILAGE_SYSTEM", "z-anatomy-ligaments.glb", 0.58)
    build_single_layer("CardioVascular41.fbx", VASCULAR_MATERIALS, "VASCULAR_SYSTEM", "z-anatomy-vessels.glb", 0.36)
    print("ANATOMY_LAYER_BUILD_COMPLETE")
