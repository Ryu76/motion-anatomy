"""Build web-optimized Z-Anatomy system layers and animated muscle morphs.

Usage:
  blender --background --python scripts/build_anatomy_layers.py -- \
    .asset-src apps/web/public/models/z-anatomy
"""

import bmesh
import bpy
import math
import sys
from pathlib import Path

args = sys.argv[sys.argv.index("--") + 1:]
source_dir = Path(args[0]).resolve()
target_dir = Path(args[1]).resolve()
target_dir.mkdir(parents=True, exist_ok=True)

MUSCLE_EXCLUDED = {"Tendon", "Fascia", "Ligament.001", "Bursa", "Cartilage.001", "Articular capsule.001"}
VASCULAR_MATERIALS = {"Artery", "Vein", "Pulmonary artery", "Pulmonary vein"}
JOINT_MATERIALS = {"Ligament", "Cartilage", "Articular capsule", "Suture-1", "Fat"}
TARGET_MUSCLES = {
    "Gluteus maximus muscle.l": "MUSCLE_GLUTEUS_MAXIMUS_L",
    "Gluteus maximus muscle.r": "MUSCLE_GLUTEUS_MAXIMUS_R",
    "Rectus femoris muscle.l": "MUSCLE_RECTUS_FEMORIS_L",
    "Rectus femoris muscle.r": "MUSCLE_RECTUS_FEMORIS_R",
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
    if not result.data.polygons:
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
    axis = 2
    radial = (0, 1)
    low = min(point[axis] for point in coords)
    high = max(point[axis] for point in coords)
    center = (low + high) / 2
    radial_center = [sum(point[i] for point in coords) / len(coords) for i in radial]
    span = max(high - low, 1e-6)
    for index, point in enumerate(coords):
        t = (point[axis] - low) / span
        belly = math.sin(math.pi * t) ** 2
        # The sine envelope pins both anatomical attachments and deforms the belly.
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
        filepath=str(target),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_morph=True,
        export_morph_normal=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=8,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
    )
    triangles = sum(sum(max(1, len(poly.vertices) - 2) for poly in obj.data.polygons) for obj in objects)
    print(f"LAYER_EXPORT file={filename} objects={len(objects)} triangles={triangles} bytes={target.stat().st_size}")


def build_muscular_layers():
    sources = reset_and_import(source_dir / "MuscularSystem100.fbx")
    regular_muscles = []
    animated_muscles = []
    tendons = []
    fascia = []
    for index, source in enumerate(sources):
        is_target = source.name in TARGET_MUSCLES
        muscle = extract_faces(source, lambda material: material not in MUSCLE_EXCLUDED and material != "<none>", TARGET_MUSCLES.get(source.name, f"muscle-{index}"))
        tendon = extract_faces(source, lambda material: material == "Tendon", f"tendon-{index}")
        fascial = extract_faces(source, lambda material: material == "Fascia", f"fascia-{index}")
        if muscle:
            decimate(muscle, 0.68 if is_target else 0.30)
            if is_target:
                add_muscle_morphs(muscle)
                animated_muscles.append(muscle)
            else:
                regular_muscles.append(muscle)
        if tendon:
            decimate(tendon, 0.34)
            tendons.append(tendon)
        if fascial:
            decimate(fascial, 0.44)
            fascia.append(fascial)
    muscle_body = join_objects(regular_muscles, "MUSCLE_SYSTEM_STATIC")
    tendon_body = join_objects(tendons, "TENDON_SYSTEM")
    fascia_body = join_objects(fascia, "FASCIA_SYSTEM")
    export_selected([muscle_body, *animated_muscles], "z-anatomy-muscles-detailed.glb")
    export_selected([tendon_body], "z-anatomy-tendons.glb")
    export_selected([fascia_body], "z-anatomy-fascia.glb")


def build_single_layer(source_file, accepted_materials, object_name, filename, ratio):
    sources = reset_and_import(source_dir / source_file)
    parts = []
    for index, source in enumerate(sources):
        part = extract_faces(source, accepted_materials.__contains__, f"part-{index}")
        if part:
            decimate(part, ratio)
            parts.append(part)
    body = join_objects(parts, object_name)
    export_selected([body], filename)


build_muscular_layers()
build_single_layer("Joints100.fbx", JOINT_MATERIALS, "LIGAMENT_CARTILAGE_SYSTEM", "z-anatomy-ligaments.glb", 0.58)
build_single_layer("CardioVascular41.fbx", VASCULAR_MATERIALS, "VASCULAR_SYSTEM", "z-anatomy-vessels.glb", 0.36)
print("ANATOMY_LAYER_BUILD_COMPLETE")
