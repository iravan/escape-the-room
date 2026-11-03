"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Clickable } from "./Clickable";
import { CEILING } from "@/lib/gallery";
import { ARTWORKS, artworkUrl, useArtwork, type Artwork } from "@/lib/artworks";
import { useGame } from "@/lib/store";

const FRAME = 0.035, DEPTH = 0.03, MAT = 0.14; // silver moulding, white mount (share of the frame's width)

// Framed like the original gallery: thin silver moulding, wide white mount, the picture in the middle.
function Piece({ a }: { a: Artwork }) {
  const map = useTexture(artworkUrl(a), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; });
  const img = map.image as { width: number; height: number };
  const w = a.width, mount = w * MAT, pw = w - 2 * (FRAME + mount), ph = (pw * img.height) / img.width, h = ph + 2 * (FRAME + mount);
  return (
    <Clickable hint={a.title} onTap={() => { useArtwork.setState({ open: a.id }); useGame.setState({ menu: false }); }} position={[0, 0, DEPTH / 2]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, DEPTH]} />
        <meshStandardMaterial color="#d3d5d8" metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, DEPTH / 2 + 0.001]}><planeGeometry args={[w - 2 * FRAME, h - 2 * FRAME]} /><meshStandardMaterial color="#f4f3ef" roughness={0.9} /></mesh>
      <mesh position={[0, 0, DEPTH / 2 + 0.002]}><planeGeometry args={[pw, ph]} /><meshStandardMaterial map={map} roughness={0.8} /></mesh>
    </Clickable>
  );
}

// A spotlight from the ceiling, 1 m out from the wall: light pooling on the picture.
function Light({ a }: { a: Artwork }) {
  const light = useRef<THREE.SpotLight>(null), target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => { if (light.current) light.current.target = target; }, [target]);
  return (
    <>
      <primitive object={target} position={[0, a.height - 0.15, 0]} />
      <spotLight ref={light} position={[0, CEILING - 0.1, 0.95]} angle={0.42} penumbra={0.8} intensity={6} distance={4} decay={1.4} color="#fff3e0" />
    </>
  );
}

// Every artwork from the config, hung in its spot with its own spotlight.
export function Artworks() {
  return (
    <>
      {ARTWORKS.map((a) => {
        const [x, , z] = a.spot.position;
        return (
          <group key={a.id} position={[x, 0, z]} rotation={[0, a.spot.rotation, 0]}>
            <group position={[0, a.height, 0]}><Piece a={a} /></group>
            <Light a={a} />
          </group>
        );
      })}
    </>
  );
}
