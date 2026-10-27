import { beforeEach, describe, expect, it } from "vitest";
import { useViewerStore } from "./viewer-store";

beforeEach(() => useViewerStore.getState().reset());

describe("viewer store", () => {
  it("starts with all educational layers visible", () => {
    expect(useViewerStore.getState().layerVisibility).toEqual({
      bone: true, muscle: true, tendon: true, ligament: true, fascia: true, vessel: true
    });
    expect(useViewerStore.getState().layerOpacity).toEqual({
      bone: 1, muscle: 1, tendon: 1, ligament: 1, fascia: 0.5, vessel: 1
    });
  });

  it("toggles a layer without changing other layers", () => {
    useViewerStore.getState().toggleLayer("muscle");
    expect(useViewerStore.getState().layerVisibility.muscle).toBe(false);
    expect(useViewerStore.getState().layerVisibility.bone).toBe(true);
  });

  it("signals camera restoration even when the current preset is selected again", () => {
    const before = useViewerStore.getState().cameraRevision;
    useViewerStore.getState().setCameraPreset("front");
    expect(useViewerStore.getState().cameraRevision).toBe(before + 1);

    useViewerStore.getState().reset();
    expect(useViewerStore.getState().cameraRevision).toBe(before + 2);
  });

  it("clears hidden selection and isolate mode atomically", () => {
    useViewerStore.getState().selectStructure("MUSCLE_GLUTEUS_MAXIMUS_L");
    useViewerStore.getState().toggleIsolate();
    useViewerStore.getState().toggleLayer("muscle", "muscle");

    const state = useViewerStore.getState();
    expect(state.layerVisibility.muscle).toBe(false);
    expect(state.selectedStructureId).toBeNull();
    expect(state.hoveredStructureId).toBeNull();
    expect(state.isolateMode).toBe(false);
  });

  it("keeps the selected anatomy ID when the sex model changes", () => {
    useViewerStore.getState().selectStructure("MUSCLE_GLUTEUS_MAXIMUS_L");
    useViewerStore.getState().setSexModel("female");
    expect(useViewerStore.getState().sexModel).toBe("female");
    expect(useViewerStore.getState().selectedStructureId).toBe("MUSCLE_GLUTEUS_MAXIMUS_L");
  });

  it("keeps the retired home motion state paused when reset", () => {
    expect(useViewerStore.getState().motionPlaying).toBe(false);
    expect(useViewerStore.getState().motionProgress).toBe(0);

    useViewerStore.getState().toggleMotionPlayback();
    expect(useViewerStore.getState().motionPlaying).toBe(true);
    useViewerStore.getState().setMotionProgress(0.75);
    expect(useViewerStore.getState().motionProgress).toBe(0.75);

    useViewerStore.getState().setLayerOpacity("muscle", 0.42);
    expect(useViewerStore.getState().layerOpacity.muscle).toBe(0.42);

    useViewerStore.getState().reset();
    expect(useViewerStore.getState().motionPlaying).toBe(false);
    expect(useViewerStore.getState().motionProgress).toBe(0);
  });
});
