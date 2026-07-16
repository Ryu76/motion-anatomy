# Asset Pipeline

Sprint 1 uses code-generated primitive geometry so no third-party anatomical asset is redistributed. A future licensed GLB must:

1. Have one stable node per selectable structure.
2. Preserve source, license, attribution, hash, and version metadata.
3. Map node names through `data/seed/model-node-map.json`.
4. Be optimized with glTF Transform and measured before commit/deploy.
5. Keep initial delivery under 20 MB and provide selection proxies.

Files under model paths are ignored until license approval. Do not commit a downloaded anatomy model merely because it is publicly accessible.
