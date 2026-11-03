"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { CameraRig } from "./CameraRig";
import { PostFX } from "./PostFX";
import { Gallery } from "./Gallery";
import { Artworks } from "./Artworks";
import { Tooltip } from "./Clickable";
import { ArtworkPanel } from "@/components/hud/ArtworkPanel";
import { TouchControls } from "@/components/hud/TouchControls";
import { Hud } from "@/components/hud/Hud";
import { ROOMS } from "@/lib/gallery";
import { useGame } from "@/lib/store";

const DPR_CAP = [1, 1.5, 2];

// Bright, even daylight like the original's baked lighting: sky fill, light falling from each round skylight,
// sun through the windows; each artwork brings its own spotlight (Artworks.tsx).
function Lights() {
  const quality = useGame((s) => s.quality);
  return (
    <>
      <hemisphereLight args={["#ffffff", "#7a625a", 2]} />
      <ambientLight intensity={0.5} />
      {Object.values(ROOMS).map((c, i) => (
        <pointLight key={i} position={[c.x, 3.1, c.z]} intensity={6} distance={9} decay={1.2} color="#f4f7ff" castShadow={quality > 0} shadow-mapSize={[1024, 1024]} shadow-bias={-0.002} />
      ))}
      <pointLight position={[1.8, 2.5, -0.1]} intensity={3} distance={8} decay={1.2} color="#fff8ee" />
    </>
  );
}

export default function Scene() {
  const quality = useGame((s) => s.quality), hideUI = useGame((s) => s.hideUI), title = useGame((s) => s.title);
  return (
    <>
      <Canvas shadows="percentage" camera={{ fov: 65, near: 0.03, far: 100 }} dpr={[1, DPR_CAP[quality]]} style={{ touchAction: "none" }}>
        <color attach="background" args={["#d9dee4"]} />
        <Suspense fallback={null}>
          <Gallery />
          <Artworks />
        </Suspense>
        <Lights />
        <CameraRig />
        <PostFX />
      </Canvas>
      <Hud />
      <TouchControls />
      {!hideUI && !title && (
        <>
          <Tooltip />
          <ArtworkPanel />
        </>
      )}
    </>
  );
}
