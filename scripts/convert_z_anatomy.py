import bpy
import sys
from pathlib import Path

args = sys.argv[sys.argv.index("--") + 1:]
source = Path(args[0]).resolve()
target = Path(args[1]).resolve()
ratio = float(args[2]) if len(args) > 2 else 0.30

target.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(source), use_anim=False)
meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
if not meshes:
    raise RuntimeError("No mesh objects were imported")

annotation_meshes = [obj for obj in meshes if not any(slot.material for slot in obj.material_slots)]
retained_meshes = [obj for obj in meshes if any(slot.material for slot in obj.material_slots)]
for obj in annotation_meshes:
    bpy.data.objects.remove(obj, do_unlink=True)
meshes = retained_meshes
print(f"ANATOMY_FILTER annotations_removed={len(annotation_meshes)} retained={len(meshes)}")

for index, obj in enumerate(meshes):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    if ratio < 0.999 and len(obj.data.polygons) >= 24:
        if obj.data.users > 1:
            obj.data = obj.data.copy()
        modifier = obj.modifiers.new(name="Web decimation", type="DECIMATE")
        modifier.ratio = ratio
        modifier.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    if index % 100 == 0:
        print(f"ANATOMY_DECIMATE progress={index}/{len(meshes)}")

bpy.ops.object.select_all(action="DESELECT")
for obj in meshes:
    obj.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.join()
body = bpy.context.active_object
body.name = "Z-Anatomy Web Reference"

for polygon in body.data.polygons:
    polygon.use_smooth = True

bpy.ops.object.select_all(action="DESELECT")
body.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.export_scene.gltf(
    filepath=str(target),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_yup=True,
    export_materials="EXPORT",
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=8,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
)

triangles = sum(max(1, len(poly.vertices) - 2) for poly in body.data.polygons)
print(f"ANATOMY_EXPORT target={target} vertices={len(body.data.vertices)} triangles={triangles} materials={len(body.data.materials)}")
