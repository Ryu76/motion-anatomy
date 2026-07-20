"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Color, Mesh, MeshStandardMaterial, Object3D } from "three";
import type { IUniform } from "three";
import { getFunctionalMotionFrame, type FunctionalMotionId } from "@/lib/anatomy/functional-motion";

type CompiledShader = { uniforms: Record<string, IUniform>; vertexShader: string };

type Layer = "bone" | "muscle" | "fascia" | "tendon";
type View = "front" | "side" | "back" | "free";

const assets: Record<Layer, string> = {
  bone: "/models/z-anatomy/z-anatomy-skeletal-system.glb",
  muscle: "/models/z-anatomy/z-anatomy-muscles-detailed.glb",
  fascia: "/models/z-anatomy/z-anatomy-fascia.glb",
  tendon: "/models/z-anatomy/z-anatomy-tendons.glb",
};
const layerNames: Record<Layer, string> = { bone: "골격", muscle: "근육", fascia: "근막", tendon: "힘줄" };
const motionCode: Record<FunctionalMotionId, number> = { squat: 0, walking: 1, "quadriceps-stretch": 2 };

const poseShader = `
  vec4 anatomyWorld = modelMatrix * vec4(transformed, 1.0);
  float p = uMotionProgress;
  float depth = 1.0 - abs(2.0 * p - 1.0);
  float wave = sin(p * 6.28318530718);
  float side = anatomyWorld.x >= 0.0 ? 1.0 : -1.0;
  float angle = 0.0;
  vec2 pivot = vec2(0.0);
  if (uMotionKind < 0.5) {
    if (anatomyWorld.y > 0.82) { anatomyWorld.y -= 0.26 * depth; anatomyWorld.z += 0.05 * depth; }
    else {
      angle = radians(anatomyWorld.y > 0.43 ? -48.0 * depth : 24.0 * depth);
      pivot = vec2(anatomyWorld.y > 0.43 ? 0.82 : 0.43, 0.0);
    }
  } else if (uMotionKind < 1.5) {
    float gait = wave * side;
    if (anatomyWorld.y > 0.82) anatomyWorld.y += abs(gait) * 0.015;
    else {
      angle = radians(anatomyWorld.y > 0.43 ? 28.0 * gait : (28.0 * gait - 42.0 * max(0.0, -gait)));
      pivot = vec2(anatomyWorld.y > 0.43 ? 0.82 : 0.43, 0.0);
    }
  } else if (anatomyWorld.x > 0.0 && anatomyWorld.y < 0.82) {
    float stretch = sin(p * 3.14159265359);
    angle = radians(anatomyWorld.y > 0.43 ? 8.0 * stretch : -128.0 * stretch);
    pivot = vec2(anatomyWorld.y > 0.43 ? 0.82 : 0.43, 0.0);
  }
  if (abs(angle) > 0.0001) {
    vec2 yz = anatomyWorld.yz - pivot;
    anatomyWorld.yz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * yz + pivot;
  }
  transformed = (inverse(modelMatrix) * anatomyWorld).xyz;
`;

function prepareScene(scene: Object3D, layer: Layer, opacity: number) {
  const clone = scene.clone(true);
  clone.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const sources = Array.isArray(node.material) ? node.material : [node.material];
    const materials = sources.map((source) => {
      const material = source instanceof MeshStandardMaterial ? source.clone() : new MeshStandardMaterial();
      if (layer === "bone") material.color = new Color("#dedbd0");
      material.opacity = opacity; material.transparent = opacity < 0.99; material.depthWrite = opacity > 0.9;
      material.metalness = 0; material.roughness = 0.72;
      material.onBeforeCompile = (shader) => {
        const compiled = shader as unknown as CompiledShader;
        compiled.uniforms.uMotionProgress = { value: 0 };
        compiled.uniforms.uMotionKind = { value: 0 };
        compiled.vertexShader = compiled.vertexShader
          .replace("void main() {", "uniform float uMotionProgress;\nuniform float uMotionKind;\nvoid main() {")
          .replace("#include <project_vertex>", `${poseShader}\n#include <project_vertex>`);
        material.userData.motionShader = compiled;
      };
      material.customProgramCacheKey = () => "functional-anatomy-pose-v1";
      return material;
    });
    node.material = materials.length === 1 ? materials[0] : materials;
  });
  return clone;
}

function setMorph(mesh: Mesh, name: string, value: number) {
  const index = mesh.morphTargetDictionary?.[name];
  if (index !== undefined && mesh.morphTargetInfluences) mesh.morphTargetInfluences[index] = value;
}

function MotionModel({ motion, progress, visible, opacity }: { motion: FunctionalMotionId; progress: number; visible: Record<Layer, boolean>; opacity: Record<Layer, number> }) {
  const bone = useGLTF(assets.bone, "/draco/"); const muscle = useGLTF(assets.muscle, "/draco/");
  const fascia = useGLTF(assets.fascia, "/draco/"); const tendon = useGLTF(assets.tendon, "/draco/");
  const scenes = useMemo(() => ({
    bone: prepareScene(bone.scene, "bone", 1), muscle: prepareScene(muscle.scene, "muscle", 1),
    fascia: prepareScene(fascia.scene, "fascia", 1), tendon: prepareScene(tendon.scene, "tendon", 1),
  }), [bone.scene, fascia.scene, muscle.scene, tendon.scene]);
  useEffect(() => {
    for (const [layer, scene] of Object.entries(scenes) as [Layer, Object3D][]) scene.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        material.opacity = opacity[layer]; material.transparent = opacity[layer] < 0.99; material.depthWrite = opacity[layer] > 0.9; material.needsUpdate = true;
      }
    });
  }, [opacity, scenes]);
  useFrame(() => {
    const frame = getFunctionalMotionFrame(motion, progress);
    for (const [layer, scene] of Object.entries(scenes) as [Layer, Object3D][]) scene.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        const shader = material.userData.motionShader as CompiledShader | undefined;
        if (shader) { shader.uniforms.uMotionProgress.value = progress; shader.uniforms.uMotionKind.value = motionCode[motion]; }
      }
      if (layer !== "muscle") return;
      const target = node.name.includes("GLUTEUS") ? frame.tissues.gluteus : node.name.includes("RECTUS_FEMORIS") ? frame.tissues.rectusFemoris : null;
      if (!target) return;
      setMorph(node, "Lengthen", target.mode === "eccentric" || target.mode === "passive-stretch" ? target.morph : 0);
      setMorph(node, "Shorten", target.mode === "concentric" ? target.morph : 0);
    });
  });
  return <group scale={2.46} position={[0, -2.15, 0]}>{(Object.keys(scenes) as Layer[]).map((layer) => visible[layer] && <primitive key={layer} object={scenes[layer]} />)}</group>;
}

function Camera({ view }: { view: View }) {
  const { camera } = useThree(); const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  useEffect(() => {
    const positions: Record<View, [number, number, number]> = { front: [0, 0.15, 5.6], side: [5.6, 0.15, 0], back: [0, 0.15, -5.6], free: [3.6, 1.8, 4.4] };
    camera.position.set(...positions[view]); camera.lookAt(0, 0.05, 0); controls.current?.target.set(0, 0.05, 0); controls.current?.update();
  }, [camera, view]);
  return <OrbitControls ref={controls} target={[0, 0.05, 0]} minDistance={3} maxDistance={8} />;
}

export function FunctionalMotionViewer({ motion }: { motion: FunctionalMotionId }) {
  const [playing, setPlaying] = useState(false); const [progress, setProgress] = useState(0); const [view, setView] = useState<View>("front");
  const [visible, setVisible] = useState<Record<Layer, boolean>>({ bone: true, muscle: true, fascia: true, tendon: false });
  const [opacity, setOpacity] = useState<Record<Layer, number>>({ bone: 0.72, muscle: 1, fascia: 0.42, tendon: 0.8 });
  const lastTime = useRef(0);
  useEffect(() => {
    if (!playing) return;
    let handle = 0;
    const tick = (time: number) => { if (lastTime.current) setProgress((value) => (value + (time - lastTime.current) / 6000) % 1); lastTime.current = time; handle = requestAnimationFrame(tick); };
    handle = requestAnimationFrame(tick); return () => { cancelAnimationFrame(handle); lastTime.current = 0; };
  }, [playing]);
  const frame = getFunctionalMotionFrame(motion, progress);
  return <section className="functional-viewer" aria-label="기능 해부학 3D 동작 뷰어" data-motion={motion} data-pose-progress={progress.toFixed(3)}>
    <header className="functional-viewer-head"><div><span className="eyebrow">CONTINUOUS FUNCTIONAL ANATOMY</span><h2>실제 해부 메시 동작 분석</h2><p>Z-Anatomy 메시의 공간 관절 변형과 원본 정점 morph를 하나의 연속 타임라인에 동기화합니다.</p></div><strong aria-live="polite">{frame.phaseLabel}</strong></header>
    <div className="functional-viewer-grid"><aside className="motion-layers" aria-label="동작 해부 레이어">{(Object.keys(layerNames) as Layer[]).map((layer) => <div key={layer}><button type="button" aria-pressed={visible[layer]} onClick={() => setVisible((state) => ({ ...state, [layer]: !state[layer] }))}>{layerNames[layer]} {visible[layer] ? "표시" : "숨김"}</button><label>{layerNames[layer]} 투명도<input aria-label={`${layerNames[layer]} 투명도`} type="range" min="0.1" max="1" step="0.05" value={opacity[layer]} onChange={(event) => setOpacity((state) => ({ ...state, [layer]: Number(event.target.value) }))}/></label></div>)}</aside>
      <div className="motion-stage"><div className="motion-view-buttons" role="group" aria-label="동작 카메라 시점">{(["front", "side", "back", "free"] as View[]).map((item) => <button type="button" key={item} aria-pressed={view === item} onClick={() => setView(item)}>{{ front: "정면", side: "측면", back: "후면", free: "자유 회전" }[item]}</button>)}</div><div className="motion-canvas"><Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.15, 5.6], fov: 38 }}><color attach="background" args={["#061219"]}/><ambientLight intensity={1.15}/><directionalLight position={[3, 5, 4]} intensity={2.4}/><Suspense fallback={null}><MotionModel motion={motion} progress={progress} visible={visible} opacity={opacity}/><Environment preset="warehouse" environmentIntensity={0.28}/></Suspense><Camera view={view}/></Canvas></div></div>
      <aside className="motion-status" aria-label="조직 상태"><h3>조직 반응</h3><dl><div><dt>대둔근</dt><dd>{frame.tissues.gluteus.label}</dd></div><div><dt>대퇴직근</dt><dd>{frame.tissues.rectusFemoris.label}</dd></div><div><dt>근막</dt><dd>{frame.tissues.fascia.label}</dd></div></dl><p>근막은 능동 수축이 아닌 수동 신장·장력·이완으로 표시합니다.</p><div className="joint-readout">고관절 {Math.round(frame.joints.leftHipFlexion)}° · 무릎 {Math.round(frame.joints.leftKneeFlexion)}°</div></aside></div>
    <div className="motion-timeline" role="group" aria-label="동작 타임라인"><button type="button" onClick={() => setPlaying((value) => !value)}>{playing ? "일시정지" : "재생"}</button><input aria-label="동작 진행률" type="range" min="0" max="1" step="0.001" value={progress} onChange={(event) => { setPlaying(false); setProgress(Number(event.target.value)); }}/><output>{Math.round(progress * 100)}%</output></div>
  </section>;
}

for (const url of Object.values(assets)) useGLTF.preload(url, "/draco/");
