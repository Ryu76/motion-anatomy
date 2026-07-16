# Architecture

Sprint 1 separates concerns into five boundaries:

- `apps/web`: interaction, camera, selection, accessible panels, and procedural sample geometry.
- `apps/api`: read-only anatomy API backed by validated JSON seed data.
- `packages/shared-types`: framework-independent TypeScript contracts.
- `packages/anatomy-schema`: Zod runtime validation for web/seed boundaries.
- `data/seed`: bilingual anatomy content independent from UI and 3D nodes.

A stable structure `code` connects API records to `model-node-map.json`; UI components do not embed anatomy descriptions. PostgreSQL is provisioned with an Alembic-managed `anatomy_structure` table so later editorial workflows can adopt persistence without changing the public structure contract. Sprint 1 reads reviewed sample content from JSON; database writes and editorial CRUD remain out of scope.

No medical diagnosis or quantitative EMG claims are made. Actual GLB assets remain outside Git until source, redistribution rights, attribution, hash, and version are reviewed.
