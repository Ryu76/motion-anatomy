# Anatomy ID Convention

Format: `<TYPE>_<STRUCTURE>_<SIDE>` in uppercase ASCII.

Types supported in Sprint 1: `BONE`, `MUSCLE`, `TENDON`, `LIGAMENT`, `FASCIA`.

`JOINT` is a reserved roadmap type and is not accepted by the current schema.
Sides: `L`, `R`, or omitted for midline structures.

Examples: `MUSCLE_GLUTEUS_MAXIMUS_L`, `BONE_FEMUR_R`, `FASCIA_THORACOLUMBAR`.
IDs are stable data keys. Display names and GLB node names may change without changing IDs.
