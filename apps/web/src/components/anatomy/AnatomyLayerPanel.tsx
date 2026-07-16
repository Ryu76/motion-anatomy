"use client";
import type { StructureType } from "@/types/anatomy";
import { useViewerStore } from "@/stores/viewer-store";

const labels: Record<StructureType, string> = { bone: "뼈", muscle: "근육", tendon: "힘줄", ligament: "인대", fascia: "근막" };
const layers: StructureType[] = ["bone", "muscle", "tendon", "ligament", "fascia"];

export function AnatomyLayerPanel({ selectedStructureType = null }: { selectedStructureType?: StructureType | null }) {
  const visibility = useViewerStore((state) => state.layerVisibility);
  const toggle = useViewerStore((state) => state.toggleLayer);
  return <section className="panel layer-panel" aria-labelledby="layer-title">
    <div className="panel-kicker">ANATOMY LAYERS</div><h2 id="layer-title">해부학 레이어</h2>
    <div className="layer-list">{layers.map((layer) => <button key={layer} type="button" aria-pressed={visibility[layer]} onClick={() => toggle(layer, selectedStructureType)} className="layer-toggle">
      <span className={`layer-dot layer-${layer}`} /><span>{labels[layer]}</span><span className="toggle-state">{visibility[layer] ? "표시" : "숨김"}</span>
    </button>)}</div>
  </section>;
}
