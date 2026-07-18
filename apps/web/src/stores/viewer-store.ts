import { create } from "zustand";
import type { CameraPreset, SexModel, StructureType } from "@/types/anatomy";

type LayerVisibility = Record<StructureType, boolean>;
type LayerOpacity = Record<StructureType, number>;

const visibleLayers = (): LayerVisibility => ({
  bone: true,
  muscle: true,
  tendon: true,
  ligament: true,
  fascia: true,
  vessel: true,
});

const defaultLayerOpacity = (): LayerOpacity => ({
  bone: 1,
  muscle: 1,
  tendon: 1,
  ligament: 1,
  fascia: 0.5,
  vessel: 1,
});

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

type ViewerState = {
  sexModel: SexModel;
  selectedStructureId: string | null;
  hoveredStructureId: string | null;
  layerVisibility: LayerVisibility;
  layerOpacity: LayerOpacity;
  cameraPreset: CameraPreset;
  cameraRevision: number;
  isolateMode: boolean;
  motionPlaying: boolean;
  motionProgress: number;
  setSexModel: (model: SexModel) => void;
  selectStructure: (code: string | null) => void;
  hoverStructure: (code: string | null) => void;
  toggleLayer: (layer: StructureType, selectedLayer?: StructureType | null) => void;
  setLayerOpacity: (layer: StructureType, opacity: number) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  toggleIsolate: () => void;
  toggleMotionPlayback: () => void;
  setMotionPlaying: (playing: boolean) => void;
  setMotionProgress: (progress: number) => void;
  reset: () => void;
};

export const useViewerStore = create<ViewerState>((set) => ({
  sexModel: "male",
  selectedStructureId: null,
  hoveredStructureId: null,
  layerVisibility: visibleLayers(),
  layerOpacity: defaultLayerOpacity(),
  cameraPreset: "front",
  cameraRevision: 0,
  isolateMode: false,
  motionPlaying: true,
  motionProgress: 0,
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
  setLayerOpacity: (layer, opacity) => set((state) => ({
    layerOpacity: { ...state.layerOpacity, [layer]: clamp01(opacity) },
  })),
  setCameraPreset: (cameraPreset) => set((state) => ({ cameraPreset, cameraRevision: state.cameraRevision + 1 })),
  toggleIsolate: () => set((state) => ({ isolateMode: !state.isolateMode })),
  toggleMotionPlayback: () => set((state) => ({ motionPlaying: !state.motionPlaying })),
  setMotionPlaying: (motionPlaying) => set({ motionPlaying }),
  setMotionProgress: (motionProgress) => set({ motionProgress: clamp01(motionProgress) }),
  reset: () => set((state) => ({
    sexModel: "male",
    selectedStructureId: null,
    hoveredStructureId: null,
    layerVisibility: visibleLayers(),
    layerOpacity: defaultLayerOpacity(),
    cameraPreset: "front",
    cameraRevision: state.cameraRevision + 1,
    isolateMode: false,
    motionPlaying: true,
    motionProgress: 0,
  })),
}));
