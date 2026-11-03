"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Clickable } from "./Clickable";
import { useLayout } from "@/lib/room";
import { ARTWORKS, artworkUrl, useArtwork, type Artwork, type Wall } from "@/lib/artworks";
import type { Vec3 } from "@/lib/store";

const FRAME = 0.03, DEPTH = 0.025;

// Wall centre and the turn that faces local +z into the room; local +x is then "to your right" facing the wall.
function wallPose(wall: Wall, w: number, d: number): { p: Vec3; rot: number } {
  if (wall === "front") return { p: [0, 0, d / 2], rot: Math.PI };
  if (wall === "left") return { p: [-w / 2, 0, 0], rot: Math.PI / 2 };
  if (wall === "right") return { p: [w / 2, 0, 0], rot: -Math.PI / 2 };
  return { p: [0, 0, -d / 2], rot: 0 };
}

function Piece({ a }: { a: Artwork }) {
  const map = useTexture(artworkUrl(a), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; });
  const img = map.image as { width: number; height: number };
  const w = a.width, h = (w * img.height) / img.width;
  return (
    <Clickable hint={a.title} onTap={() => useArtwork.setState({ open: a.id })} position={[a.at, a.height, DEPTH / 2]}>
      <mesh castShadow>
        <boxGeometry args={[w + FRAME * 2, h + FRAME * 2, DEPTH]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, DEPTH / 2 + 0.001]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={map} roughness={0.8} />
      </mesh>
    </Clickable>
  );
}

// Every artwork from the config, hung on its wall.
export function Artworks() {
  const { w, d } = useLayout((s) => s.size);
  return (
    <>
      {ARTWORKS.map((a) => {
        const { p, rot } = wallPose(a.wall, w, d);
        return (
          <group key={a.id} position={p} rotation={[0, rot, 0]}>
            <Piece a={a} />
          </group>
        );
      })}
    </>
  );
}
