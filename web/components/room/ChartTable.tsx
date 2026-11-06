"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Clickable } from "./Clickable";
import { CEILING, CHART_TABLE } from "@/lib/gallery";
import { CHART_ASPECT, drawChart, usePuzzle } from "@/lib/puzzle";
import { useGame } from "@/lib/store";

const TOP = 0.82, W = 1.1, H = W * CHART_ASPECT, TILT = 1.2; // table height, board size (m), board tilt back from upright

// The final puzzle in the room: a walnut table with the printed hiragana chart on a slanted board, holes and all.
// The board redraws as pieces go in; click it to play.
export function ChartTable() {
  const placed = usePuzzle((s) => s.placed), holes = usePuzzle((s) => s.holes);
  const canvas = useMemo(() => document.createElement("canvas"), []);
  const map = useMemo(() => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }, [canvas]);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useEffect(() => {
    const draw = () => { drawChart(canvas.getContext("2d")!, placed, holes); if (mat.current?.map) mat.current.map.needsUpdate = true; };
    draw();
    document.fonts?.ready.then(draw); // the kana font may arrive after the first draw
  }, [canvas, placed, holes]);
  const light = useRef<THREE.SpotLight>(null), target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => { if (light.current) light.current.target = target; }, [target]);
  return (
    <group position={[CHART_TABLE.x, 0, CHART_TABLE.z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, TOP / 2, 0]} castShadow><boxGeometry args={[W + 0.1, TOP, 0.7]} /><meshStandardMaterial color="#6b4636" roughness={0.6} /></mesh>
      <mesh position={[0, TOP + 0.1, -0.22]}><boxGeometry args={[W * 0.8, 0.2, 0.04]} /><meshStandardMaterial color="#4a3026" roughness={0.6} /></mesh>
      <Clickable hint="Hiragana chart: click to play" onTap={() => useGame.setState({ dialog: "puzzle", menu: false })} position={[0, TOP + 0.01 + (H / 2) * Math.cos(TILT), 0]}>
        <mesh rotation={[-TILT, 0, 0]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial ref={mat} map={map} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      </Clickable>
      <primitive object={target} position={[0, TOP, 0]} />
      <spotLight ref={light} position={[0, CEILING - 0.1, 0.6]} angle={0.5} penumbra={0.8} intensity={6} distance={4} decay={1.4} color="#fff3e0" />
    </group>
  );
}
