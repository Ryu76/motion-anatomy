"use client";
import type { StructureType } from "@/types/anatomy";
import { useViewerStore } from "@/stores/viewer-store";

const labels: Record<StructureType, string> = {
  bone: "골격",
  muscle: "근육",
  tendon: "힘줄",
  ligament: "인대",
  fascia: "근막",
  vessel: "혈관",
};
const layers: StructureType[] = ["bone", "muscle", "tendon", "ligament", "fascia", "vessel"];

export function AnatomyLayerPanel({ selectedStructureType = null }: { selectedStructureType?: StructureType | null }) {
  const visibility = useViewerStore((state) => state.layerVisibility);
  const opacity = useViewerStore((state) => state.layerOpacity);
  const toggle = useViewerStore((state) => state.toggleLayer);
  const setOpacity = useViewerStore((state) => state.setLayerOpacity);

  return <section className="panel layer-panel" aria-labelledby="layer-title">
    <div className="panel-kicker">해부 계통</div>
    <h2 id="layer-title">해부학 레이어</h2>
    <div className="layer-list">{layers.map((layer) => <div className="layer-item" key={layer}>
      <button type="button" aria-pressed={visibility[layer]} onClick={() => toggle(layer, selectedStructureType)} className="layer-toggle">
        <span className={`layer-dot layer-${layer}`} />
        <span>{labels[layer]}</span>
        <span className="toggle-state">{visibility[layer] ? "표시" : "숨김"}</span>
      </button>
      <label className="layer-opacity">
        <span className="sr-only">{labels[layer]} 투명도</span>
        <input
          type="range"
          aria-label={`${labels[layer]} 투명도`}
          min="0.12"
          max="1"
          step="0.01"
          value={opacity[layer]}
          disabled={!visibility[layer]}
          onChange={(event) => setOpacity(layer, Number(event.target.value))}
        />
        <output>{Math.round(opacity[layer] * 100)}%</output>
      </label>
    </div>)}</div>
  </section>;
}
