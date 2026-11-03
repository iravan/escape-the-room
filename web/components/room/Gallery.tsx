"use client";

import { useMemo, type ReactNode } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  BENCHES, CORRIDOR, DEG, DOOR, H, PLANTS, R, ROOMS, SPOTS, TABLES, WINDOW, WINDOWS, corridorEnd, corridorGap, faceCentre, onWall, type Room, type Spot, type Vec3,
} from "@/lib/gallery";
import { useGame } from "@/lib/store";

// The building, all from code: two round rooms with stepped skylights, the corridor between them, and their
// furniture (pedestal tables, curved benches, plants, windows with sheer curtains, the blue door).
const WHITE = "#eef0f2", BAND = "#3b3b3e", SKIRT = "#8f9095", DOOR_BLUE = "#2c6482";

// ---------- materials ----------

// `lit`: surfaces that only see light from below (ceilings) get some of the original's baked bounce light.
function White({ side = THREE.FrontSide, lit = 0 }: { side?: THREE.Side; lit?: number }) {
  return <meshStandardMaterial color={WHITE} roughness={0.85} side={side} emissive={WHITE} emissiveIntensity={lit} />;
}

// Dark planks with world-space UVs, so the floors of both rooms and the corridor line up.
function useFloor() {
  const [map, normalMap, arm] = useTexture(["diff", "nor", "arm"].map((k) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/textures/dark_wooden_planks_${k}.jpg`), (ts) => {
    for (const t of ts) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; }
    ts[0].colorSpace = THREE.SRGBColorSpace;
  });
  return useMemo(() => new THREE.MeshStandardMaterial({ map, normalMap, aoMap: arm, roughnessMap: arm, color: "#e0c4bc", roughness: 1 }), [map, normalMap, arm]);
}
function worldUV(g: THREE.BufferGeometry, tile = 1.5) {
  const p = g.attributes.position, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { uv[i * 2] = p.getX(i) / tile; uv[i * 2 + 1] = p.getZ(i) / tile; }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

// ---------- curved walls ----------

// A piece of a round room's wall between two angles and heights, seen from inside.
function Arc({ room, a0, a1, y0, y1, r = R, color = WHITE, top, lit = 0 }: { room: Room; a0: number; a1: number; y0: number; y1: number; r?: number; color?: string; top?: number; lit?: number }) {
  const c = ROOMS[room];
  // three's cylinder starts at +z and turns toward +x; our angles start at +x and turn toward +z.
  const g = useMemo(() => new THREE.CylinderGeometry(top ?? r, r, y1 - y0, Math.max(4, Math.ceil((a1 - a0) / 3)), 1, true, (90 - a1) * DEG, (a1 - a0) * DEG), [r, top, y0, y1, a0, a1]);
  return (
    <mesh geometry={g} position={[c.x, (y0 + y1) / 2, c.z]} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.85} side={THREE.BackSide} emissive={color} emissiveIntensity={lit} />
    </mesh>
  );
}

// Openings in a room's wall, as [from, to, kind] in degrees (to > from).
function gaps(room: Room): [number, number, "corridor" | "window"][] {
  const [c0, c1] = corridorGap(room), w = WINDOWS[room];
  return [[c0, c1, "corridor"], [w - WINDOW.half, w + WINDOW.half, "window"]];
}

function RoomWalls({ room }: { room: Room }) {
  const pieces: ReactNode[] = [];
  const g = gaps(room).sort((a, b) => a[0] - b[0]);
  // Solid wall between consecutive openings, going once round from the end of the first opening.
  for (let i = 0; i < g.length; i++) {
    const from = g[i][1], to = g[(i + 1) % g.length][0] + (i + 1 === g.length ? 360 : 0);
    pieces.push(<Arc key={`w${i}`} room={room} a0={from} a1={to} y0={0} y1={H.ceiling} />);
    pieces.push(<Arc key={`s${i}`} room={room} a0={from} a1={to} y0={0} y1={H.skirting} r={R - 0.015} color={SKIRT} />);
  }
  for (const [a0, a1, kind] of g) {
    if (kind === "window") {
      pieces.push(<Arc key={`wb${a0}`} room={room} a0={a0} a1={a1} y0={0} y1={WINDOW.bottom} />);
      pieces.push(<Arc key={`ws${a0}`} room={room} a0={a0} a1={a1} y0={0} y1={H.skirting} r={R - 0.015} color={SKIRT} />);
      pieces.push(<Arc key={`wt${a0}`} room={room} a0={a0} a1={a1} y0={WINDOW.top} y1={H.ceiling} />);
    } else pieces.push(<Arc key={`c${a0}`} room={room} a0={a0} a1={a1} y0={H.band} y1={H.ceiling} />);
  }
  return (
    <>
      {pieces}
      {/* Dark band and white coving all the way round, over the openings too */}
      <Arc room={room} a0={0} a1={360} y0={H.band} y1={H.coving} r={R - 0.008} color={BAND} />
      <Arc room={room} a0={0} a1={360} y0={H.coving} y1={H.ceiling} r={R - 0.008} top={R - 0.16} lit={0.4} />
    </>
  );
}

// ---------- ceilings ----------

// Stepped round skylight: the profile (radius, height) turned round, a glowing cove, dark glass with crossing glazing bars.
const OCULUS: [number, number][] = [[2.1, 2.63], [2.1, 2.67], [2.04, 2.68], [2.01, 2.72], [1.96, 2.75], [1.93, 2.81], [1.92, 2.86], [1.92, 2.94], [1.89, 2.95], [1.86, 2.98], [1.85, 3.02], [1.56, 3.03], [1.56, 3.27]];
function RoomCeiling({ room }: { room: Room }) {
  const c = ROOMS[room];
  const ring = useMemo(() => new THREE.RingGeometry(2.1, R + 0.02, 96), []);
  const lathe = useMemo(() => new THREE.LatheGeometry(OCULUS.map(([r, y]) => new THREE.Vector2(r, y)), 96), []);
  const cove = useMemo(() => new THREE.RingGeometry(1.56, 1.85, 96), []);
  const glass = useMemo(() => new THREE.CircleGeometry(1.57, 64), []);
  return (
    <group position={[c.x, 0, c.z]}>
      <mesh geometry={ring} position={[0, H.ceiling, 0]} rotation={[Math.PI / 2, 0, 0]}><White lit={0.55} /></mesh>
      <mesh geometry={lathe}><White side={THREE.DoubleSide} lit={0.45} /></mesh>
      <mesh geometry={cove} position={[0, 3.022, 0]} rotation={[Math.PI / 2, 0, 0]}><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <mesh geometry={glass} position={[0, 3.26, 0]} rotation={[Math.PI / 2, 0, 0]}><meshBasicMaterial color="#47484d" /></mesh>
      {[-0.55, 0.55].flatMap((o) => [45, -45].map((t) => (
        <mesh key={`${o}${t}`} position={[o * Math.cos(t * DEG), 3.25, o * Math.sin(t * DEG)]} rotation={[0, -t * DEG, 0]}>
          <boxGeometry args={[0.012, 0.012, 2 * Math.sqrt(1.56 ** 2 - o * o)]} />
          <meshBasicMaterial color="#e8e8e8" />
        </mesh>
      )))}
    </group>
  );
}

// ---------- corridor ----------

function Corridor() {
  const parts: ReactNode[] = [];
  for (const side of ["north", "south"] as const) {
    const z = CORRIDOR[side], x0 = corridorEnd("west", z), x1 = corridorEnd("east", z), len = x1 - x0, mid = (x0 + x1) / 2;
    const face = side === "north" ? 0 : Math.PI, inward = side === "north" ? 1 : -1;
    const wall = (key: string, y0: number, y1: number, color: string, d = 0) => (
      <mesh key={side + key} position={[mid, (y0 + y1) / 2, z + inward * d]} rotation={[0, face, 0]} receiveShadow>
        <planeGeometry args={[len, y1 - y0]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    );
    parts.push(wall("wall", 0, H.ceiling, WHITE), wall("skirt", 0, H.skirting, SKIRT, 0.015), wall("band", H.band, H.coving, BAND, 0.008));
    // coving: a slanted strip from the band up to the ceiling
    parts.push(
      <mesh key={side + "cove"} position={[mid, (H.coving + H.ceiling) / 2, z + inward * 0.08]} rotation={[inward * -0.75, face, 0]}>
        <planeGeometry args={[len, 0.22]} />
        <White lit={0.4} />
      </mesh>,
    );
  }
  // Flat ceiling with a narrow glazed slot down the middle, lit along both edges.
  const x0 = corridorEnd("west", 0), x1 = corridorEnd("east", 0), len = x1 - x0, mid = (x0 + x1) / 2;
  const slot = [-0.36, -0.14] as const;
  const strip = (z0: number, z1: number, key: string) => (
    <mesh key={key} position={[mid, H.ceiling, (z0 + z1) / 2]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[len, z1 - z0]} /><White lit={0.5} /></mesh>
  );
  parts.push(strip(CORRIDOR.north, slot[0], "c0"), strip(slot[1], CORRIDOR.south, "c1"));
  for (const z of slot) {
    parts.push(
      <mesh key={`slot${z}`} position={[mid, H.ceiling + 0.2, z]} rotation={[0, z === slot[0] ? 0 : Math.PI, 0]}><planeGeometry args={[len, 0.4]} /><White lit={0.35} /></mesh>,
      <mesh key={`led${z}`} position={[mid, H.ceiling - 0.003, z + (z === slot[0] ? 0.012 : -0.012)]}><boxGeometry args={[len, 0.004, 0.012]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>,
    );
  }
  parts.push(<mesh key="glass" position={[mid, H.ceiling + 0.4, (slot[0] + slot[1]) / 2]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[len, slot[1] - slot[0]]} /><meshStandardMaterial color="#3e3f44" roughness={0.3} /></mesh>);
  for (let x = x0 + 0.3; x < x1; x += 0.6)
    parts.push(<mesh key={`bar${x}`} position={[x, H.ceiling + 0.39, (slot[0] + slot[1]) / 2]}><boxGeometry args={[0.015, 0.015, slot[1] - slot[0]]} /><meshBasicMaterial color="#d8d8d8" /></mesh>);
  return <>{parts}</>;
}

// ---------- floor ----------

function Floors() {
  const mat = useFloor();
  const geos = useMemo(() => {
    const out = Object.values(ROOMS).map((c) => worldUV(new THREE.CircleGeometry(R + 0.02, 96).rotateX(-Math.PI / 2).translate(c.x, 0, c.z)));
    const x0 = ROOMS.west.x, x1 = ROOMS.east.x;
    out.push(worldUV(new THREE.PlaneGeometry(x1 - x0, CORRIDOR.south - CORRIDOR.north).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, -0.0005, (CORRIDOR.north + CORRIDOR.south) / 2)));
    for (const g of out) g.setAttribute("uv1", g.attributes.uv);
    return out;
  }, []);
  return <>{geos.map((g, i) => <mesh key={i} geometry={g} material={mat} receiveShadow />)}</>;
}

// ---------- fixtures on the walls ----------

// Something standing against a round room's wall at an angle, local +z facing the room.
function OnWall({ room, at, inset = 0, children }: { room: Room; at: number; inset?: number; children: ReactNode }) {
  const [x, z] = onWall(room, at, inset);
  return <group position={[x, 0, z]} rotation={[0, faceCentre(at), 0]}>{children}</group>;
}

const box = (key: string, p: Vec3, s: Vec3, color = WHITE) => (
  <mesh key={key} position={p} castShadow receiveShadow><boxGeometry args={s} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
);

// What you see through a window: pale sky behind dark, leafy trees (drawn once on a canvas).
function useOutside() {
  return useMemo(() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 256;
    const g = c.getContext("2d")!, sky = g.createLinearGradient(0, 0, 0, 256);
    sky.addColorStop(0, "#f4f7f8"); sky.addColorStop(1, "#dfe7e2");
    g.fillStyle = sky; g.fillRect(0, 0, 256, 256);
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 260; i++) {
      const x = rnd() * 256, y = 60 + rnd() * 220, r = 6 + rnd() * 18, k = Math.floor(40 + rnd() * 50);
      g.fillStyle = `rgb(${k - 20},${k + 10},${k - 25})`; g.globalAlpha = 0.85;
      g.beginPath(); g.arc(x - 90 + y * 0.4, y, r, 0, Math.PI * 2); g.fill();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

// Sash window: white frame, 2 × 3 panes, a sill, bright sky behind, a sheer curtain swept to one side.
function Window({ room }: { room: Room }) {
  const w = 2 * R * Math.sin(WINDOW.half * DEG), h = WINDOW.top - WINDOW.bottom, cy = (WINDOW.top + WINDOW.bottom) / 2, t = 0.06;
  const view = useOutside();
  const curtain = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.75, 2.4, 12, 24), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), k = (1.2 - y) / 2.4; // 0 at the rail, 1 at the floor
      p.setX(i, x * (1 - 0.55 * k) + 0.25 * k * k);
      p.setZ(i, 0.05 * Math.sin(x * 22 + y * 2) + 0.35 * k * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <OnWall room={room} at={WINDOWS[room]} inset={0.02}>
      <mesh position={[0, cy, -0.12]}><planeGeometry args={[w, h]} /><meshBasicMaterial map={view} toneMapped={false} /></mesh>
      {box("top", [0, WINDOW.top - t / 2, 0], [w, t, 0.1])}
      {box("bottom", [0, WINDOW.bottom + t / 2, 0], [w, t, 0.1])}
      {box("left", [-w / 2 + t / 2, cy, 0], [t, h, 0.1])}
      {box("right", [w / 2 - t / 2, cy, 0], [t, h, 0.1])}
      {box("mullion", [0, cy, -0.02], [0.03, h, 0.05])}
      {[1, 2].map((i) => box(`bar${i}`, [0, WINDOW.bottom + (h * i) / 3, -0.02], [w, 0.03, 0.05]))}
      {box("sill", [0, WINDOW.bottom - 0.03, 0.06], [w + 0.16, 0.05, 0.2], "#9a9ba0")}
      <mesh position={[0, 2.39, 0.2]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.012, 0.012, w + 0.3]} /><meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} /></mesh>
      <mesh geometry={curtain} position={[-w / 2 + 0.1, 1.2, 0.22]}><meshStandardMaterial color="#eef3f6" transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    </OnWall>
  );
}

// Arched blue door in a white surround with a round leaded window, the surround's circle bulging to one side.
function Door() {
  const shapes = useMemo(() => {
    const arch = (w: number, h: number) => {
      const s = new THREE.Shape();
      s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0);
      return s;
    };
    const bevel = { depth: 0.03, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3, curveSegments: 24 };
    const ring = new THREE.Shape().absarc(0, 0, 0.47, 0, Math.PI * 2, false);
    ring.holes.push(new THREE.Path().absarc(0, 0, 0.34, 0, Math.PI * 2, true));
    return { surround: new THREE.ExtrudeGeometry(arch(1.0, 2.3), bevel), door: new THREE.ShapeGeometry(arch(0.78, 2.12), 24), ring: new THREE.ExtrudeGeometry(ring, bevel), glass: new THREE.CircleGeometry(0.34, 48) };
  }, []);
  return (
    <OnWall room={DOOR.room} at={DOOR.at} inset={0.035}>
      <mesh geometry={shapes.surround} castShadow receiveShadow><White /></mesh>
      <mesh geometry={shapes.ring} position={[0.12, 1.6, 0.03]} castShadow receiveShadow><White /></mesh>
      <mesh geometry={shapes.door} position={[0, 0, 0.055]}><meshStandardMaterial color={DOOR_BLUE} roughness={0.6} /></mesh>
      {[-0.13, 0.13].map((x) => box(`plank${x}`, [x, 1.0, 0.057], [0.008, 2.0, 0.004], "#244f66"))}
      <mesh geometry={shapes.glass} position={[0.12, 1.6, 0.058]}><meshStandardMaterial color="#1e2a33" roughness={0.2} metalness={0.4} /></mesh>
      {box("lead-v", [0.12, 1.6, 0.062], [0.02, 0.68, 0.01], "#cfd3d6")}
      {box("lead-h", [0.12, 1.6, 0.062], [0.68, 0.02, 0.01], "#cfd3d6")}
    </OnWall>
  );
}

// ---------- furniture ----------

// White pedestal table: round top, turned column, three curved feet.
function Table({ x, z, children }: { x: number; z: number; children?: ReactNode }) {
  const column = useMemo(() => new THREE.LatheGeometry([[0, 0.15], [0.06, 0.16], [0.045, 0.24], [0.03, 0.5], [0.035, 0.8], [0.05, 0.86], [0.0, 0.87]].map(([r, y]) => new THREE.Vector2(r, y)), 24), []);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.885, 0]} castShadow receiveShadow><cylinderGeometry args={[0.5, 0.48, 0.03, 48]} /><White /></mesh>
      <mesh geometry={column} castShadow><White /></mesh>
      {[0, 120, 240].map((a) => (
        <mesh key={a} position={[0.13 * Math.cos(a * DEG), 0.08, 0.13 * Math.sin(a * DEG)]} rotation={[0, -a * DEG, -0.55]} castShadow><boxGeometry args={[0.3, 0.03, 0.04]} /><White /></mesh>
      ))}
      <group position={[0, 0.9, 0]}>{children}</group>
    </group>
  );
}

// Curved white bench following the east room's wall, 2 m from its centre.
function Bench({ at }: { at: number }) {
  const c = ROOMS.east, span = 46, r = 2.0;
  const seat = useMemo(() => {
    const s = new THREE.Shape(), a0 = (at - span / 2) * DEG, a1 = (at + span / 2) * DEG;
    s.absarc(0, 0, r + 0.19, a0, a1, false); s.absarc(0, 0, r - 0.19, a1, a0, true);
    return new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, curveSegments: 32 }).rotateX(Math.PI / 2);
  }, [at]);
  return (
    <group position={[c.x, 0, c.z]}>
      <mesh geometry={seat} position={[0, 0.47, 0]} castShadow receiveShadow><White /></mesh>
      {[-1, 1].map((s) => {
        const a = (at + s * (span / 2 - 6)) * DEG;
        return <mesh key={s} position={[r * Math.cos(a), 0.2, r * Math.sin(a)]} rotation={[0, -a, 0]} castShadow><cylinderGeometry args={[0.035, 0.06, 0.4, 4]} /><White /></mesh>;
      })}
    </group>
  );
}

// Tall leafy plant in a white bulb vase.
function Plant({ x, z, seed = 1 }: { x: number; z: number; seed?: number }) {
  const { vase, leaf } = useMemo(() => {
    const vase = new THREE.LatheGeometry([[0, 0], [0.09, 0], [0.16, 0.09], [0.15, 0.2], [0.08, 0.32], [0.065, 0.36], [0, 0.36]].map(([r, y]) => new THREE.Vector2(r, y)), 24);
    const s = new THREE.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(0.035, 0.12, 0, 0.26); s.quadraticCurveTo(-0.035, 0.12, 0, 0);
    return { vase, leaf: new THREE.ShapeGeometry(s, 6) };
  }, []);
  const stems = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const a = (i * 137.5 + seed * 40) * DEG, lean = 0.12 + (i % 3) * 0.08, h = 0.7 + ((i * 7 + seed) % 5) * 0.12;
    return { a, lean, h, leaves: Array.from({ length: 5 }, (_, j) => ({ y: h * (0.45 + j * 0.13), turn: j * 1.9 + i })) };
  }), [seed]);
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={vase} castShadow receiveShadow><White /></mesh>
      {stems.map((st, i) => (
        <group key={i} position={[0, 0.34, 0]} rotation={[0, st.a, st.lean]}>
          <mesh position={[0, st.h / 2, 0]}><cylinderGeometry args={[0.005, 0.008, st.h, 4]} /><meshStandardMaterial color="#7d8a52" /></mesh>
          {st.leaves.map((l, j) => (
            <mesh key={j} geometry={leaf} position={[0, l.y, 0]} rotation={[0.9, l.turn, 0]} castShadow>
              <meshStandardMaterial color={j % 2 ? "#6f8f47" : "#86a35a"} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Every hanging spot has a track light on the ceiling 1 m out from its wall, lit or not.
export function trackAt(s: Spot): Vec3 {
  const [x, , z] = s.position;
  return [x + Math.sin(s.rotation), H.ceiling, z + Math.cos(s.rotation)];
}

// Track spotlight on the ceiling, aimed at a point on a wall.
export function TrackLight({ position, target }: { position: Vec3; target: Vec3 }) {
  const dir = new THREE.Vector3(...target).sub(new THREE.Vector3(...position)).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  return (
    <group position={position}>
      <mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.03, 0.03, 0.03, 16]} /><meshStandardMaterial color="#e6e6e6" metalness={0.5} roughness={0.3} /></mesh>
      <group position={[0, -0.09, 0]} quaternion={q}>
        <mesh><cylinderGeometry args={[0.035, 0.04, 0.12, 16]} /><meshStandardMaterial color="#dcdcdc" metalness={0.5} roughness={0.3} /></mesh>
        <mesh position={[0, -0.061, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.032, 16]} /><meshBasicMaterial color="#fff8e8" toneMapped={false} side={THREE.DoubleSide} /></mesh>
      </group>
    </group>
  );
}

// Sun through each window: a narrow warm spotlight from outside, so the glazing bars throw their pattern on the floor.
function Sun({ room }: { room: Room }) {
  const quality = useGame((s) => s.quality);
  const [ox, oz] = onWall(room, WINDOWS[room], -2.6), [tx, tz] = onWall(room, WINDOWS[room], 2.2);
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(tx, 0, tz);
  return (
    <>
      <primitive object={target} />
      <spotLight position={[ox, 4.2, oz]} target={target} angle={0.24} penumbra={0.3} intensity={60} distance={12} decay={1.2} color="#fff1d6" castShadow={quality === 2} shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
    </>
  );
}

export function Gallery() {
  return (
    <>
      <Floors />
      {SPOTS.map((s) => <TrackLight key={s.id} position={trackAt(s)} target={s.position} />)}
      {(Object.keys(ROOMS) as Room[]).map((room) => (
        <group key={room}>
          <RoomWalls room={room} />
          <RoomCeiling room={room} />
          <Window room={room} />
          <Sun room={room} />
        </group>
      ))}
      <Corridor />
      <Door />
      <Table x={TABLES[0][0]} z={TABLES[0][1]}>
        <mesh position={[0, 0.03, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><boxGeometry args={[0.34, 0.05, 0.34]} /><meshStandardMaterial color="#1c1c1e" roughness={0.5} /></mesh>
        <mesh position={[0, 0.15, 0]} castShadow><sphereGeometry args={[0.1, 32, 16]} /><meshStandardMaterial color="#a89a86" roughness={0.35} metalness={0.4} /></mesh>
      </Table>
      <Table x={TABLES[1][0]} z={TABLES[1][1]}>
        <group scale={0.45}><Plant x={-0.15} z={0} seed={3} /></group>
      </Table>
      {PLANTS.map(([x, z], i) => <Plant key={i} x={x} z={z} seed={i + 1} />)}
      {BENCHES.map((at) => <Bench key={at} at={at} />)}
    </>
  );
}

