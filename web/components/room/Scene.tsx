"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { CameraRig } from "./CameraRig";
import { PostFX } from "./PostFX";
import { Model as Gallery } from "./GalleryModel";
import { Artworks } from "./Artworks";
import { ChartTable } from "./ChartTable";
import { Tooltip } from "./Clickable";
import { TouchControls } from "@/components/hud/TouchControls";
import { Hud } from "@/components/hud/Hud";
import { useGame } from "@/lib/store";

const DPR_CAP = [1, 1.5, 2];

// The gallery is drawn unlit (its light is baked in); these light only the artworks hung in it.
function Lights() {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#8a7a70", 1.6]} />
      <ambientLight intensity={0.6} />
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
        <ChartTable />
        <Lights />
        <CameraRig />
        <PostFX />
      </Canvas>
      <Hud />
      <TouchControls />
      {!hideUI && !title && <Tooltip />}
    </>
  );
}
