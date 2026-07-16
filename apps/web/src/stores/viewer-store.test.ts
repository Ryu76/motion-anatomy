import { beforeEach, describe, expect, it } from "vitest";
import { useViewerStore } from "./viewer-store";

beforeEach(() => useViewerStore.getState().reset());

describe("viewer store", () => {
  it("starts with all educational layers visible", () => {
    expect(useViewerStore.getState().layerVisibility).toEqual({
      bone: true, muscle: true, tendon: true, ligament: true, fascia: true
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
});
