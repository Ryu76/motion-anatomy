# Z-Anatomy model attribution

The anatomical reference meshes in this directory are adapted from:

- **BodyParts3D — The Database Center for Life Science** — CC BY-SA 2.1 Japan
- **Z-Anatomy — The open source atlas of anatomy** — CC BY-SA 4.0
- Source repository: https://github.com/LluisV/Z-Anatomy
- Source files: `Resources/Models/FBX/MuscularSystem100.fbx`, `SkeletalSystem100.fbx`, `Joints100.fbx`, and `CardioVascular41.fbx`

The web derivatives are separated by anatomical system, geometry-decimated, and Draco-compressed for interactive rendering. The detailed muscle derivative preserves one selectable GLB node for every material-face-classified source muscle object (no `MUSCLE_SYSTEM_STATIC` merge). It adds project-authored `Shorten` and `Lengthen` morph targets only to the original gluteus maximus and rectus femoris vertices while pinning the attachment ends. The adapted model assets remain available under CC BY-SA 4.0. Application source code is governed separately by the repository license.

## MuscularSystem100 provenance

- Acquired from `PC-Version` commit `6c7f9016bd5899ac8edafd31b9900c151df42ed6` on 2026-07-23.
- Exact upstream blob: https://github.com/LluisV/Z-Anatomy/blob/PC-Version/Resources/Models/FBX/MuscularSystem100.fbx
- Local gitignored input: `.asset-src/MuscularSystem100.fbx` (37,343,180 bytes)
- Input SHA-256: `4c19df534d5d84aabbce08604306aa0485b43e8a2483c72a95b569e1dfea2279`
- Generated output contract, source checksum, node geometry, and output checksum: `data/generated/z-anatomy-muscles-manifest.json`

The full source-to-node manifest and generated seed mappings are deterministic build outputs. They are validated by `scripts/validate_muscle_asset.py` before release.

License text is preserved in `LICENSE.txt`.
