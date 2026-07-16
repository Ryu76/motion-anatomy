import { create } from "zustand";
import type { CameraPreset, SexModel, StructureType } from "@/types/anatomy";

type LayerVisibility = Record<StructureType, boolean>;
const visibleLayers = (): LayerVisibility => ({ bone: true, muscle: true, tendon: true, ligament: true, fascia: true });

type ViewerState = {
  sexModel: SexModel;
  selectedStructureId: string | null;
  hoveredStructureId: string | null;
  layerVisibility: LayerVisibility;
  cameraPreset: CameraPreset;
  cameraRevision: number;
  isolateMode: boolean;
  setSexModel: (model: SexModel) => void;
  selectStructure: (code: string | null) => void;
  hoverStructure: (code: string | null) => void;
  toggleLayer: (layer: StructureType, selectedLayer?: StructureType | null) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  toggleIsolate: () => void;
  reset: () => void;
};

export const useViewerStore = create<ViewerState>((set) => ({
  sexModel: "male", selectedStructureId: null, hoveredStructureId: null,
  layerVisibility: visibleLayers(), cameraPreset: "front", cameraRevision: 0, isolateMode: false,
  setSexModel: (sexModel) => set({ sexModel }),
  selectStructure: (selectedStructureId) => set({ selectedStructureId }),
  hoverStructure: (hoveredStructureId) => set({ hoveredStructureId }),
  toggleLayer: (layer, selectedLayer = null) => set((state) => {
    const hidesSelection = state.layerVisibility[layer] && selectedLayer === layer;
    return {
      layerVisibility: { ...state.layerVisibility, [layer]: !state.layerVisibility[layer] },
      ...(hidesSelection ? { selectedStructureId: null, hoveredStructureId: null, isolateMode: false } : {}),
    };
  }),
  setCameraPreset: (cameraPreset) => set((state) => ({ cameraPreset, cameraRevision: state.cameraRevision + 1 })),
  toggleIsolate: () => set((state) => ({ isolateMode: !state.isolateMode })),
  reset: () => set((state) => ({ sexModel: "male", selectedStructureId: null, hoveredStructureId: null, layerVisibility: visibleLayers(), cameraPreset: "front", cameraRevision: state.cameraRevision + 1, isolateMode: false }))
}));
