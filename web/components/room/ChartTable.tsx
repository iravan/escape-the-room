"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Clickable } from "./Clickable";
import { CEILING, CHART_TABLE } from "@/lib/gallery";
import { CHART_ASPECT, drawChart, usePuzzle } from "@/lib/puzzle";
import { useGame } from "@/lib/store";

const TOP = 0.82, W = 1.1, H = W * CHART_ASPECT, TILT = 1.2; // table height, board size (m), board tilt back from upright

function paint(
  canvas: HTMLCanvasElement,
  placed: ReturnType<typeof usePuzzle.getState>["placed"],
  holes: number[],
  lang: ReturnType<typeof usePuzzle.getState>["lang"],
) {
  const g = canvas.getContext("2d")!;
  if (lang) drawChart(g, placed, holes, lang);
  else {
    canvas.width = 768; canvas.height = 512;
    g.fillStyle = "#f6efdf"; g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = "#6b4636"; g.font = "600 36px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("Choose a language to begin", canvas.width / 2, canvas.height / 2);
  }
}

// The final puzzle in the room: a walnut table with the printed chart on a slanted board.
// A fresh CanvasTexture is built whenever the language or board state changes (and again when CJK fonts load).
export function ChartTable() {
  const placed = usePuzzle((s) => s.placed), holes = usePuzzle((s) => s.holes), lang = usePuzzle((s) => s.lang);
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => { document.fonts?.ready.then(() => setFontsReady(true)); }, []);
  const canvas = useMemo(() => document.createElement("canvas"), []);
  const map = useMemo(() => {
    paint(canvas, placed, holes, lang);
    // fontsReady is only here to rebuild once CJK fonts finish loading.
    void fontsReady;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas, placed, holes, lang, fontsReady]);
  useEffect(() => () => map.dispose(), [map]);
  const light = useRef<THREE.SpotLight>(null), target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => { if (light.current) light.current.target = target; }, [target]);
  return (
    <group position={[CHART_TABLE.x, 0, CHART_TABLE.z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, TOP / 2, 0]} castShadow><boxGeometry args={[W + 0.1, TOP, 0.7]} /><meshStandardMaterial color="#6b4636" roughness={0.6} /></mesh>
      <mesh position={[0, TOP + 0.1, -0.22]}><boxGeometry args={[W * 0.8, 0.2, 0.04]} /><meshStandardMaterial color="#4a3026" roughness={0.6} /></mesh>
      <Clickable hint="Language chart: click to play" onTap={() => useGame.setState({ dialog: "puzzle", menu: false })} position={[0, TOP + 0.01 + (H / 2) * Math.cos(TILT), 0]}>
        <mesh rotation={[-TILT, 0, 0]}>
          <planeGeometry args={[W, H]} />
          {/* key remounts the material so Three.js actually swaps the new canvas map */}
          <meshBasicMaterial key={map.uuid} map={map} color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      </Clickable>
      <primitive object={target} position={[0, TOP, 0]} />
      <spotLight ref={light} position={[0, CEILING - 0.1, 0.6]} angle={0.5} penumbra={0.8} intensity={6} distance={4} decay={1.4} color="#fff3e0" />
    </group>
  );
}
