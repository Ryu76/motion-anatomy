import bpy
import sys
from pathlib import Path

source = Path(sys.argv[sys.argv.index("--") + 1]).resolve()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(source), use_anim=False)
meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
vertices = sum(len(obj.data.vertices) for obj in meshes)
polygons = sum(len(obj.data.polygons) for obj in meshes)
triangles = sum(sum(max(1, len(poly.vertices) - 2) for poly in obj.data.polygons) for obj in meshes)
from mathutils import Vector

coords = []
for obj in meshes:
    coords.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
mins = [min(point[i] for point in coords) for i in range(3)]
maxs = [max(point[i] for point in coords) for i in range(3)]
print(f"ANATOMY_STATS meshes={len(meshes)} vertices={vertices} polygons={polygons} triangles={triangles}")
print(f"ANATOMY_BOUNDS min={mins} max={maxs} size={[maxs[i]-mins[i] for i in range(3)]}")
print("ANATOMY_NAMES " + " | ".join(obj.name for obj in meshes[:30]))
