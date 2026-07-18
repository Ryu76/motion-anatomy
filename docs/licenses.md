# Licenses

## Production anatomy assets

The web viewer includes derived, Draco-compressed GLB reference systems from:

- **Z-Anatomy — The open source atlas of anatomy**: CC BY-SA 4.0
- **BodyParts3D — The Database Center for Life Science**: CC BY-SA 2.1 Japan

Distributed derivatives include:

- `apps/web/public/models/z-anatomy/z-anatomy-skeletal-system.glb`
- `apps/web/public/models/z-anatomy/z-anatomy-muscles-detailed.glb`
- `apps/web/public/models/z-anatomy/z-anatomy-tendons.glb`
- `apps/web/public/models/z-anatomy/z-anatomy-fascia.glb`
- `apps/web/public/models/z-anatomy/z-anatomy-ligaments.glb`
- `apps/web/public/models/z-anatomy/z-anatomy-vessels.glb`

The source FBX files are not shipped. Reproducible layer separation, decimation, morph generation, and compression are implemented in `scripts/build_anatomy_layers.py`. Full attribution, source URLs, modification notes, and license links are preserved in `apps/web/public/models/z-anatomy/ATTRIBUTION.md` and attribution is displayed in the application footer.

The gluteus maximus and rectus femoris `Shorten`/`Lengthen` morph targets are project-created modifications of the licensed meshes. They are functional anatomy simulations and are not validated for diagnosis or treatment planning.

## Asset review checklist

Before another asset enters production, record commercial use, attribution, modification, redistribution, source-file exposure, derived render rights, and share-alike obligations. Legal and anatomy review must be marked approved.
