"use client";

import type { AnatomyStructure } from "@/types/anatomy";
import { useViewerStore } from "@/stores/viewer-store";
import { ZAnatomyReferenceModel } from "./ZAnatomyReferenceModel";

export function SampleHumanModel({ structures }: { structures: AnatomyStructure[] }) {
  const sex = useViewerStore((state) => state.sexModel);
  return <group scale={sex === "female" ? [0.95, 0.98, 0.93] : [1, 1, 1]}>
    <ZAnatomyReferenceModel structures={structures} />
  </group>;
}
