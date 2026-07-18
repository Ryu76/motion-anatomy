import bpy
import re
import sys
from collections import Counter
from pathlib import Path

source = Path(sys.argv[sys.argv.index("--") + 1]).resolve()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(source), use_anim=False)
meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
materials = Counter()
for obj in meshes:
    names = tuple(slot.material.name if slot.material else "<none>" for slot in obj.material_slots) or ("<none>",)
    materials.update(names)
print(f"ASSET file={source.name} meshes={len(meshes)} vertices={sum(len(o.data.vertices) for o in meshes)} triangles={sum(sum(max(1, len(p.vertices)-2) for p in o.data.polygons) for o in meshes)}")
for name, count in materials.most_common():
    print(f"MATERIAL count={count} name={name}")
print("TARGETS")
pattern = re.compile(r"glute|rectus fem|tendon|fascia|aponeur|arter|vein|aorta|heart|ligament|cartilage|joint", re.I)
for obj in meshes:
    mats = ",".join(slot.material.name if slot.material else "<none>" for slot in obj.material_slots)
    if pattern.search(obj.name + " " + mats):
        bounds = [(min(v.co[i] for v in obj.data.vertices), max(v.co[i] for v in obj.data.vertices)) for i in range(3)] if obj.data.vertices else []
        print(f"OBJECT polys={len(obj.data.polygons)} name={obj.name} mats={mats} dimensions={tuple(round(v, 4) for v in obj.dimensions)} local_bounds={bounds}")
