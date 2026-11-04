"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Clickable } from "./Clickable";
import { CEILING, type Spot } from "@/lib/gallery";
import { ARTWORKS, artworkUrl, useArtwork, type Artwork } from "@/lib/artworks";
import { useGame } from "@/lib/store";

const FRAME = 0.035, DEPTH = 0.03, MAT = 0.14, MOUNT = 0.07; // silver moulding; white mount: share of the frame's width, or 7 cm round a real-size picture

// Framed like the original gallery: thin silver moulding, white mount, the picture in the middle. With known
// dimensions the picture is its real size (a photo with slightly different proportions is cropped, never stretched);
// otherwise it fills the spot's width.
function Piece({ a }: { a: Artwork }) {
  const map = useTexture(artworkUrl(a), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; });
  const img = map.image as { width: number; height: number }, photo = img.width / img.height;
  let pw: number, ph: number, mount: number;
  if (a.size) [pw, ph, mount] = [a.size[0], a.size[1], MOUNT];
  else { mount = a.width * MAT; pw = a.width - 2 * (FRAME + mount); ph = pw / photo; }
  const w = pw + 2 * (FRAME + mount), h = ph + 2 * (FRAME + mount);
  const picture = useMemo(() => {
    const g = new THREE.PlaneGeometry(pw, ph), uv = g.attributes.uv, k = pw / ph / photo; // crop the photo to the real proportions
    for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.5 + (uv.getX(i) - 0.5) * Math.min(1, k), 0.5 + (uv.getY(i) - 0.5) * Math.min(1, 1 / k));
    return g;
  }, [pw, ph, photo]);
  return (
    <Clickable hint={a.title} onTap={() => { useArtwork.setState({ open: a.id }); useGame.setState({ menu: false }); }} position={[0, 0, DEPTH / 2]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, DEPTH]} />
        <meshStandardMaterial color="#d3d5d8" metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, DEPTH / 2 + 0.001]}><planeGeometry args={[w - 2 * FRAME, h - 2 * FRAME]} /><meshStandardMaterial color="#f4f3ef" roughness={0.9} /></mesh>
      <mesh geometry={picture} position={[0, 0, DEPTH / 2 + 0.002]}><meshStandardMaterial map={map} roughness={0.8} /></mesh>
    </Clickable>
  );
}

// ---------- covering the original picture's place ----------
// The model's walls have their light baked in, and the patch behind each original picture was never lit: it's dark.
// With the original hidden, a "wall" patch covers it, coloured from the real wall just outside its four corners
// (blended across, edges faded), so the wall reads as continuous behind your artwork.
const PATCH = 0.07, FADE = 0.08; // beyond the original's edges: its blurred shadow; then a fade into the real wall
// 4 × 4 grid: an opaque middle (the patch) and a ring around it that fades to transparent.
function patchGeometry(s: Spot) {
  const X = s.w / 2 + PATCH, Y = s.h / 2 + PATCH, xs = [-X - FADE, -X, X, X + FADE], ys = [Y + FADE, Y, -Y, -Y - FADE];
  const g = new THREE.PlaneGeometry(1, 1, 3, 3), p = g.attributes.position;
  for (let iy = 0; iy < 4; iy++) for (let ix = 0; ix < 4; ix++) p.setXY(iy * 4 + ix, xs[ix], ys[iy]);
  return g;
}
const pixels = new Map<unknown, ImageData>();
function texel(map: THREE.Texture, uv: THREE.Vector2) { // colour of the baked texture at a uv
  const img = map.image as CanvasImageSource & { width: number; height: number } | undefined;
  if (!img?.width) return null;
  let d = pixels.get(img);
  if (!d) {
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const g = c.getContext("2d", { willReadFrequently: true })!; g.drawImage(img, 0, 0);
    pixels.set(img, (d = g.getImageData(0, 0, c.width, c.height)));
  }
  const f = (v: number) => v - Math.floor(v), u = f(uv.x), v = map.flipY ? 1 - f(uv.y) : f(uv.y);
  const i = (Math.min(d.height - 1, Math.floor(v * d.height)) * d.width + Math.min(d.width - 1, Math.floor(u * d.width))) * 4;
  return new THREE.Color().setRGB(d.data[i] / 255, d.data[i + 1] / 255, d.data[i + 2] / 255, THREE.SRGBColorSpace);
}
// Colour each vertex from the four corner samples (top-left, top-right, bottom-left, bottom-right), blended across;
// the outer ring is transparent so the patch fades into the wall.
function paintPatch(geo: THREE.BufferGeometry, s: Spot, [tl, tr, bl, br]: THREE.Color[]) {
  const X = s.w / 2 + PATCH, Y = s.h / 2 + PATCH, p = geo.attributes.position, rgba: number[] = [], c = new THREE.Color(), d = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const u = THREE.MathUtils.clamp((p.getX(i) + X) / (2 * X), 0, 1), v = THREE.MathUtils.clamp((Y - p.getY(i)) / (2 * Y), 0, 1);
    c.copy(tl).lerp(tr, u); d.copy(bl).lerp(br, u); c.lerp(d, v);
    const ring = i % 4 === 0 || i % 4 === 3 || i < 4 || i >= 12;
    rgba.push(c.r, c.g, c.b, ring ? 0 : 1);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(rgba, 4));
}
const ray = new THREE.Raycaster(), from = new THREE.Vector3(), into = new THREE.Vector3();
function WallPatch({ s }: { s: Spot }) {
  const scene = useThree((t) => t.scene), mesh = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => patchGeometry(s), [s]);
  useEffect(() => {
    let frame = 0;
    const sample = () => {
      const root = scene.getObjectByName("Sketchfab_Scene"), m = mesh.current;
      if (!root || !m) { frame = requestAnimationFrame(sample); return; }
      root.updateMatrixWorld(true);
      const x = s.w / 2 + PATCH + FADE, y = s.h / 2 + PATCH + FADE, out: THREE.Color[] = [];
      for (const [cx, cy] of [[-x, y], [x, y], [-x, -y], [x, -y]]) {
        from.set(cx, cy, 0.3).applyMatrix4(m.matrixWorld); into.set(0, 0, -1).transformDirection(m.matrixWorld);
        ray.set(from, into);
        const hit = ray.intersectObject(root, true).find((h) => { const mat = (h.object as THREE.Mesh).material as THREE.MeshBasicMaterial; return h.object.visible && !mat.transparent && mat.map && h.uv; });
        const c = hit && texel(((hit.object as THREE.Mesh).material as THREE.MeshBasicMaterial).map!, hit.uv!);
        if (!c) { frame = requestAnimationFrame(sample); return; } // textures not decoded yet
        out.push(c);
      }
      paintPatch(geo, s, out);
      m.visible = true;
    };
    frame = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(frame);
  }, [scene, s, geo]);
  return (
    <mesh ref={mesh} geometry={geo} position={[0, s.position[1], 0.003]} visible={false}>
      <meshBasicMaterial vertexColors transparent depthWrite={false} />
    </mesh>
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
            <WallPatch s={a.spot} />
            <group position={[0, a.height, 0]}><Piece a={a} /></group>
            <Light a={a} />
          </group>
        );
      })}
    </>
  );
}
