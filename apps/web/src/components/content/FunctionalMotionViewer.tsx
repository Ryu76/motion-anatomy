"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Color, Mesh, MeshStandardMaterial, Object3D } from "three";
import type { FunctionalContent } from "@/lib/content-catalog";
import {
  advanceMotionProgress,
  getFunctionalMotionFrame,
  getFunctionalTargetStates,
  getMorphWeights,
  type FunctionalTargetState,
} from "@/lib/anatomy/functional-motion";

type Layer = "bone" | "muscle" | "fascia" | "tendon";
type View = "front" | "side" | "back" | "free";

const assets: Record<Layer, string> = {
  bone: "/models/z-anatomy/z-anatomy-skeletal-system.glb",
  muscle: "/models/z-anatomy/z-anatomy-muscles-detailed.glb",
  fascia: "/models/z-anatomy/z-anatomy-fascia.glb",
  tendon: "/models/z-anatomy/z-anatomy-tendons.glb",
};
const layerNames: Record<Layer, string> = { bone: "골격", muscle: "근육", fascia: "근막", tendon: "힘줄" };
const stateColors: Record<FunctionalTargetState["mode"], [string, string, number]> = {
  rest: ["#31556b", "#102a3a", 0.3],
  concentric: ["#ef3d83", "#a40045", 0.8],
  eccentric: ["#ff8a3d", "#b64400", 0.75],
  "passive-stretch": ["#9d6cff", "#4f20b5", 0.7],
  "passive-tension": ["#2cc9d9", "#007b91", 0.65],
  release: ["#31556b", "#102a3a", 0.3],
};

function prepareScene(scene: Object3D, layer: Layer) {
  const clone = scene.clone(true);
  clone.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const sources = Array.isArray(node.material) ? node.material : [node.material];
    const materials = sources.map((source) => {
      const material = source instanceof MeshStandardMaterial ? source.clone() : new MeshStandardMaterial();
      if (layer === "bone") material.color = new Color("#dedbd0");
      material.metalness = 0;
      material.roughness = 0.72;
      material.userData.functionalBaseColor = material.color.getHex();
      material.userData.functionalBaseEmissive = material.emissive.getHex();
      material.userData.functionalBaseEmissiveIntensity = material.emissiveIntensity;
      return material;
    });
    node.material = materials.length === 1 ? materials[0] : materials;
  });
  return clone;
}

function setMorph(mesh: Mesh, name: "Shorten" | "Lengthen", value: number) {
  const index = mesh.morphTargetDictionary?.[name];
  if (index !== undefined && mesh.morphTargetInfluences) mesh.morphTargetInfluences[index] = value;
}

function MotionModel({ content, progress, visible, opacity }: {
  content: FunctionalContent;
  progress: number;
  visible: Record<Layer, boolean>;
  opacity: Record<Layer, number>;
}) {
  const bone = useGLTF(assets.bone, "/draco/");
  const muscle = useGLTF(assets.muscle, "/draco/");
  const fascia = useGLTF(assets.fascia, "/draco/");
  const tendon = useGLTF(assets.tendon, "/draco/");
  const scenes = useMemo(() => ({
    bone: prepareScene(bone.scene, "bone"),
    muscle: prepareScene(muscle.scene, "muscle"),
    fascia: prepareScene(fascia.scene, "fascia"),
    tendon: prepareScene(tendon.scene, "tendon"),
  }), [bone.scene, fascia.scene, muscle.scene, tendon.scene]);
  const targets = getFunctionalTargetStates(content, progress);

  useEffect(() => {
    for (const [layer, scene] of Object.entries(scenes) as [Layer, Object3D][]) {
      scene.traverse((node) => {
        if (!(node instanceof Mesh)) return;
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          material.opacity = opacity[layer];
          material.transparent = opacity[layer] < 0.99;
          material.depthWrite = opacity[layer] > 0.9;
          material.needsUpdate = true;
        }
      });
    }
  }, [opacity, scenes]);

  useFrame(() => {
    const targetByCode = new Map(targets.map((target) => [target.code, target]));
    scenes.muscle.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const target = targetByCode.get(node.name);
      const weights = getMorphWeights(Object.keys(node.morphTargetDictionary ?? {}), target ?? { mode: "rest", morph: 0 });
      setMorph(node, "Shorten", weights.shorten);
      setMorph(node, "Lengthen", weights.lengthen);

      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        if (!(material instanceof MeshStandardMaterial)) continue;
        if (!target) {
          material.color.setHex(material.userData.functionalBaseColor as number);
          material.emissive.setHex(material.userData.functionalBaseEmissive as number);
          material.emissiveIntensity = material.userData.functionalBaseEmissiveIntensity as number;
          continue;
        }
        const [color, emissive, intensity] = stateColors[target.mode];
        material.color.set(color);
        material.emissive.set(emissive);
        material.emissiveIntensity = intensity;
      }
    });
  });

  return <group scale={2.46} position={[0, -2.15, 0]}>
    {(Object.keys(scenes) as Layer[]).map((layer) => visible[layer] && <primitive key={layer} object={scenes[layer]} />)}
  </group>;
}

function Camera({ view }: { view: View }) {
  const { camera } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  useEffect(() => {
    const positions: Record<View, [number, number, number]> = {
      front: [0, 0.15, 5.6], side: [5.6, 0.15, 0], back: [0, 0.15, -5.6], free: [3.6, 1.8, 4.4],
    };
    camera.position.set(...positions[view]);
    camera.lookAt(0, 0.05, 0);
    controls.current?.target.set(0, 0.05, 0);
    controls.current?.update();
  }, [camera, view]);
  return <OrbitControls ref={controls} target={[0, 0.05, 0]} minDistance={3} maxDistance={8} />;
}

export function FunctionalMotionViewer({ content }: { content: FunctionalContent }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [view, setView] = useState<View>("front");
  const [visible, setVisible] = useState<Record<Layer, boolean>>({ bone: true, muscle: true, fascia: true, tendon: false });
  const [opacity, setOpacity] = useState<Record<Layer, number>>({ bone: 0.72, muscle: 1, fascia: 0.42, tendon: 0.8 });
  const lastTime = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let handle = 0;
    const tick = (time: number) => {
      if (lastTime.current) setProgress((value) => advanceMotionProgress(value, time - lastTime.current, true));
      lastTime.current = time;
      handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(handle);
      lastTime.current = 0;
    };
  }, [playing]);

  const frame = getFunctionalMotionFrame(content, progress);
  const targets = getFunctionalTargetStates(content, progress);

  return <section className="functional-viewer" aria-label="기능 해부학 3D 동작 뷰어" data-motion={content.slug} data-pose-progress={progress.toFixed(3)}>
    <header className="functional-viewer-head">
      <div>
        <span className="eyebrow">기능 해부학 수동 재생</span>
        <h2>중립 해부 모델의 상대 활성 재생</h2>
        <p>이 소스 자산에는 검증된 관절 리그가 없어 중립 해부 모델의 기하 형태는 변하지 않습니다. 재생은 매핑된 근육의 단계별 단축성·신장성·수동 장력 상태를 색상으로 시각화하며, 원본 morph 표적 메시만 형태가 변합니다. 이는 교육용 상대 활성 표시이며 EMG 측정값이 아닙니다.</p>
      </div>
      <strong aria-live="polite">{frame.phaseLabel}</strong>
    </header>
    <div className="functional-viewer-grid">
      <aside className="motion-layers" aria-label="동작 해부 레이어">
        {(Object.keys(layerNames) as Layer[]).map((layer) => <div key={layer}>
          <button type="button" aria-pressed={visible[layer]} onClick={() => setVisible((state) => ({ ...state, [layer]: !state[layer] }))}>{layerNames[layer]} {visible[layer] ? "표시" : "숨김"}</button>
          <label>{layerNames[layer]} 투명도<input aria-label={`${layerNames[layer]} 투명도`} type="range" min="0.1" max="1" step="0.05" value={opacity[layer]} onChange={(event) => setOpacity((state) => ({ ...state, [layer]: Number(event.target.value) }))} /></label>
        </div>)}
      </aside>
      <div className="motion-stage">
        <div className="motion-view-buttons" role="group" aria-label="동작 카메라 시점">
          {(["front", "side", "back", "free"] as View[]).map((item) => <button type="button" key={item} aria-pressed={view === item} onClick={() => setView(item)}>{{ front: "정면", side: "측면", back: "후면", free: "자유 회전" }[item]}</button>)}
        </div>
        <div className="motion-canvas"><Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.15, 5.6], fov: 38 }}>
          <color attach="background" args={["#061219"]} />
          <ambientLight intensity={1.15} />
          <directionalLight position={[3, 5, 4]} intensity={2.4} />
          <Suspense fallback={null}><MotionModel content={content} progress={progress} visible={visible} opacity={opacity} /><Environment preset="warehouse" environmentIntensity={0.28} /></Suspense>
          <Camera view={view} />
        </Canvas></div>
      </div>
      <aside className="motion-status" aria-label="목표 근육 상태">
        <h3>목표 근육 상태</h3>
        <dl>{targets.map((target) => <div key={target.code}><dt>{target.nameKo}</dt><dd>{target.label}</dd></div>)}</dl>
        <p>근막은 능동 수축이 아닌 수동 신장·장력·이완으로 표시합니다.</p>
      </aside>
    </div>
    <div className="motion-timeline" role="group" aria-label="동작 타임라인">
      <button type="button" onClick={() => setPlaying((value) => !value)}>{playing ? "일시정지" : "재생"}</button>
      <input aria-label="동작 진행률" type="range" min="0" max="1" step="0.001" value={progress} onChange={(event) => { setPlaying(false); setProgress(Number(event.target.value)); }} />
      <output>{Math.round(progress * 100)}%</output>
    </div>
  </section>;
}

for (const url of Object.values(assets)) useGLTF.preload(url, "/draco/");
