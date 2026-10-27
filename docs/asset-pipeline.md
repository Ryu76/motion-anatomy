# Z-Anatomy Asset Pipeline

The licensed Z-Anatomy/BodyParts3D derivatives are generated from gitignored source FBX files. The muscular source is acquired only from the attribution-declared upstream and its provenance/checksum is recorded in `apps/web/public/models/z-anatomy/ATTRIBUTION.md` and the generated manifest.

## Muscle build

```bash
E:/tools/blender-portable/blender-4.5.3-windows-x64/blender.exe --background \
  --python scripts/build_anatomy_layers.py -- \
  .asset-src apps/web/public/models/z-anatomy \
  data/generated/z-anatomy-muscles-manifest.json \
  data/seed/anatomy_structures.json

E:/tools/blender-portable/blender-4.5.3-windows-x64/blender.exe --background \
  --python scripts/validate_muscle_asset.py -- \
  apps/web/public/models/z-anatomy/z-anatomy-muscles-detailed.glb \
  data/generated/z-anatomy-muscles-manifest.json \
  data/seed/anatomy_structures.json
```

The builder classifies each `MuscularSystem100.fbx` source object's faces by material. Tendon, fascia, bursa, ligament, cartilage, articular-capsule, and unassigned faces are excluded from the muscle layer. Every remaining geometry-backed source muscle becomes one independently named GLB node; they must never be joined into `MUSCLE_SYSTEM_STATIC`.

`data/generated/z-anatomy-muscles-manifest.json` is the deterministic asset contract: each exported node has source object name, post-optimization vertex/triangle counts, morph list, source checksum, and generated GLB checksum. The builder regenerates `data/seed/anatomy_structures.json` muscle records and `data/seed/model-node-map.json` from this contract. Runtime selection derives its node-to-structure mapping from those seed records, not a hardcoded muscle list.

Only the two gluteus maximus and two rectus femoris nodes have `Shorten` and `Lengthen` morph targets. Other source muscle nodes are static to keep decode, memory, and animation costs bounded.

Asset contract tests verify source-to-seed one-to-one mapping, unique normalized node codes, no merged static node, geometry for every muscle, and deep psoas/iliacus coverage. The Blender validation additionally imports the Draco GLB and checks actual nodes and geometry.
