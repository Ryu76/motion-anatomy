"use client";
import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Grid, OrbitControls } from "@react-three/drei";
import type { AnatomyStructure } from "@/types/anatomy";
import { useViewerStore } from "@/stores/viewer-store";
import { SampleHumanModel } from "./SampleHumanModel";
import { getStructureFocus, type StructureFocus } from "@/lib/anatomy/camera-focus";

class ViewerErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("3D viewer failed", error, info.componentStack); }
  render() { return this.state.failed ? <div className="viewer-fallback" role="alert">3D 뷰어를 시작할 수 없습니다. 아래 구조 목록에서 동일한 정보를 확인할 수 있습니다.</div> : this.props.children; }
}

function CameraRig({ focus }: { focus: StructureFocus }) {
  const preset = useViewerStore((state) => state.cameraPreset); const revision = useViewerStore((state) => state.cameraRevision); const { camera } = useThree();
  useEffect(() => {
    const [tx, ty, tz] = focus.target; const d = focus.distance;
    const positions = { front: [tx, ty, tz + d], back: [tx, ty, tz - d], left: [tx - d, ty, tz], right: [tx + d, ty, tz], free: [tx + d * 0.66, ty + d * 0.38, tz + d * 0.78] } as const;
    const [x, y, z] = positions[preset];
    camera.position.set(x, y, z); camera.lookAt(tx, ty, tz); camera.updateProjectionMatrix();
  }, [camera, focus, preset, revision]);
  return null;
}

export function AnatomyCanvas({ structures }: { structures: AnatomyStructure[] }) {
  const clearSelection = useViewerStore((state) => state.selectStructure);
  const selectedId = useViewerStore((state) => state.selectedStructureId);
  const selected = useMemo(() => structures.find((item) => item.code === selectedId) ?? null, [selectedId, structures]);
  const focus = useMemo(() => getStructureFocus(selected), [selected]);
  return <ViewerErrorBoundary><div className="canvas-shell" aria-label="회전 및 확대 가능한 3D 해부학 모델">
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0.45, 5.8], fov: 38 }} onPointerMissed={() => clearSelection(null)} fallback={<div className="viewer-fallback">WebGL을 지원하지 않는 브라우저입니다.</div>}>
      <color attach="background" args={["#07131a"]} /><fog attach="fog" args={["#07131a", 6, 11]} />
      <ambientLight intensity={0.75} /><directionalLight position={[3, 5, 4]} intensity={2.2} castShadow /><pointLight position={[-3, 1, 2]} color="#6ee7d8" intensity={12} distance={8} />
      <SampleHumanModel structures={structures} /><Grid position={[0, -2.32, 0]} args={[8, 8]} cellColor="#19323c" sectionColor="#2b6268" fadeDistance={8} infiniteGrid />
      <CameraRig focus={focus} /><OrbitControls makeDefault target={focus.target} minDistance={2.7} maxDistance={9} enableDamping />
      <Environment preset="warehouse" environmentIntensity={0.35} />
    </Canvas>
  </div></ViewerErrorBoundary>;
}
