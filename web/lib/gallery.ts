// The gallery's plan, in metres (three's coordinates: y up, floor at 0). Two round rooms joined by a corridor,
// measured from "Richard's Art Gallery - Audio Tour" and rebuilt in code (components/room/Gallery.tsx).
// Angles are degrees around a room's centre: 0 = +x (east), 90 = +z (south).
export type Vec3 = [number, number, number];

export const R = 4.04; // inner radius of both round rooms
export const ROOMS = { west: { x: -8.71, z: -0.04 }, east: { x: 12.3, z: -0.04 } };
export const CORRIDOR = { north: -0.98, south: 0.79 }; // wall planes (z); it runs between the two rooms
export const H = { skirting: 0.17, band: 2.31, coving: 2.46, ceiling: 2.63 };
export const WINDOW = { half: 8.5, bottom: 0.95, top: 2.15 }; // half-width in degrees
export const WINDOWS = { west: 71.5, east: 110.3 };
export const DOOR = { room: "east" as const, at: 0 };

export const DEG = Math.PI / 180;
export type Room = keyof typeof ROOMS;
export const onWall = (room: Room, at: number, inset = 0): [number, number] => {
  const c = ROOMS[room];
  return [c.x + (R - inset) * Math.cos(at * DEG), c.z + (R - inset) * Math.sin(at * DEG)];
};
// Turn (about y) that faces local +z at the room's centre from a point on its wall.
export const faceCentre = (at: number) => Math.atan2(-Math.cos(at * DEG), -Math.sin(at * DEG));
// Where a corridor wall meets a round room's wall.
export const corridorEnd = (room: Room, z: number) => {
  const c = ROOMS[room], dx = Math.sqrt(R * R - (z - c.z) ** 2);
  return room === "west" ? c.x + dx : c.x - dx;
};
// The corridor's opening in each room's wall, as an angle range.
export function corridorGap(room: Room): [number, number] {
  const c = ROOMS[room], a = Math.asin((CORRIDOR.north - c.z) / R) / DEG, b = Math.asin((CORRIDOR.south - c.z) / R) / DEG;
  return room === "west" ? [a, b] : [180 - b, 180 - a];
}

// Hanging spots: where the original gallery's pictures hang. w = frame width (m), y = centre height.
export type Spot = { id: string; label: string; position: Vec3; rotation: number; w: number };
const roomSpot = (id: string, label: string, room: Room, at: number, y: number, w: number): Spot => {
  const [x, z] = onWall(room, at, 0.03);
  return { id, label, position: [x, y, z], rotation: faceCentre(at), w };
};
const wallSpot = (id: string, label: string, x: number, y: number, w: number, side: "north" | "south"): Spot => ({
  id, label, w, position: [x, y, side === "north" ? CORRIDOR.north + 0.02 : CORRIDOR.south - 0.02], rotation: side === "north" ? 0 : Math.PI,
});
export const SPOTS: Spot[] = [
  roomSpot("w1", "West room, far wall", "west", 176.4, 1.54, 1.17),
  roomSpot("w2", "West room, by the window", "west", 114.1, 1.43, 0.95),
  roomSpot("w3", "West room, right of the corridor", "west", 33.1, 1.65, 0.87),
  roomSpot("w4", "West room, left of the corridor", "west", -36.1, 1.58, 0.69),
  wallSpot("n1", "Corridor, left wall 1", -2.22, 1.59, 1.24, "north"),
  wallSpot("n2", "Corridor, left wall 2", 1.26, 1.65, 0.51, "north"),
  wallSpot("n3", "Corridor, left wall 3", 3.45, 1.6, 0.75, "north"),
  wallSpot("n4", "Corridor, left wall 4", 6.1, 1.53, 0.71, "north"),
  wallSpot("n5", "Corridor, left wall 5", 7.9, 1.6, 0.45, "north"),
  wallSpot("s1", "Corridor, right wall 1", -2.05, 1.59, 1.24, "south"),
  wallSpot("s2", "Corridor, right wall 2", 0.26, 1.56, 0.56, "south"),
  wallSpot("s3", "Corridor, right wall 3", 2.86, 1.54, 0.65, "south"),
  wallSpot("s4", "Corridor, right wall 4", 5.39, 1.56, 0.56, "south"),
  wallSpot("s5", "Corridor, right wall 5", 7.6, 1.54, 0.65, "south"),
  roomSpot("e1", "East room, right of the corridor", "east", 159, 1.57, 0.66),
  roomSpot("e2", "East room, by the window", "east", 82.6, 1.65, 0.78),
  roomSpot("e3", "East room, right of the door", "east", 50.6, 1.59, 1.11),
  roomSpot("e4", "East room, left of the corridor", "east", -120.2, 1.48, 1.08),
];

// Furniture you can't walk through: [x, z, radius].
export const OBSTACLES: [number, number, number][] = [[-8.9, 0, 0.6], [11.15, 0.95, 0.6], [-5.5, 1.0, 0.35], [9.0, -1.46, 0.35]];
export const TABLES: [number, number][] = [[-8.9, 0], [11.15, 0.95]];
export const PLANTS: [number, number][] = [[-5.5, 1.0], [9.0, -1.46]];
export const BENCHES: number[] = [-113.6, 56]; // east room, angle of the bench's middle, 2 m from the centre

// Can you stand here (eye at least `margin` from any wall or obstacle)?
export function walkable(x: number, z: number, margin = 0.35): boolean {
  if (OBSTACLES.some(([ox, oz, r]) => Math.hypot(x - ox, z - oz) < r)) return false;
  const inRoom = Object.values(ROOMS).some((c) => Math.hypot(x - c.x, z - c.z) < R - margin);
  const inCorridor = z > CORRIDOR.north + margin && z < CORRIDOR.south - margin && x > ROOMS.west.x && x < ROOMS.east.x;
  return inRoom || inCorridor;
}

export const START = { position: [-11.2, 1.6, 1.2] as Vec3, yaw: 76 }; // west room, looking down the corridor
