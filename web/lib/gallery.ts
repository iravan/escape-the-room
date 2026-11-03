// The gallery's plan, in metres (the model's own coordinates: y up, floor at 0). Two round rooms joined by a corridor,
// measured from the model (public/gallery/gallery.glb, "Richard's Art Gallery - Audio Tour").
export type Vec3 = [number, number, number];

export const R = 4.04; // inner radius of both round rooms
export const ROOMS = { west: { x: -8.71, z: -0.04 }, east: { x: 12.3, z: -0.04 } };
export const CORRIDOR = { north: -0.98, south: 0.79 }; // wall planes (z); it runs between the two rooms
export const CEILING = 2.63;

export const DEG = Math.PI / 180;
// Hanging spots: where the original gallery's pictures hang, read from the model (each picture mesh's back face, facing,
// width). A spot with one of your artworks hides the original picture (`original` = its mesh name).
export type Spot = { id: string; label: string; original: string; position: Vec3; rotation: number; w: number };
const SPOT_ROWS: [string, string, string, Vec3, number, number][] = [
  ["w1", "West room, far wall", "end_frame_end_frame_manual_bake_0", [-12.573, 1.535, 0.209], 1.5711, 1.168],
  ["w2", "West room, by the window", "seal_2_jag_manual_bake_0", [-10.306, 1.437, 3.518], 2.7181, 0.933],
  ["w3", "West room, right of the corridor", "Object009_propinquity_manual_bake_0", [-5.511, 1.645, 2.053], -2.1543, 0.853],
  ["w4", "West room, left of the corridor", "horse_and_squirrel_seal_manual_bake_0", [-5.585, 1.576, -2.329], -0.9402, 0.681],
  ["n1", "Corridor, left wall 1", "aston_manual_bake_aston_manual_bake_0", [-2.221, 1.593, -0.974], 0, 1.235],
  ["n2", "Corridor, left wall 2", "weeebo_and_tiggy_weebo_manual_bake_0", [1.256, 1.655, -0.982], 0, 0.509],
  ["n3", "Corridor, left wall 3", "scarlett_frame_scarlett_manual_bake_0", [3.445, 1.603, -0.965], 0.0005, 0.748],
  ["n4", "Corridor, left wall 4", "Object006_tess_manual_bake_0", [6.099, 1.531, -0.969], -0.0001, 0.707],
  ["n5", "Corridor, left wall 5", "SIMON_AND_JAKE_simon_manual_bake_0", [8.153, 1.601, -0.977], 0.0068, 0.448],
  ["s1", "Corridor, right wall 1", "boat_boat_manual_bake_0", [-2.055, 1.593, 0.785], 3.1416, 1.235],
  ["s2", "Corridor, right wall 2", "Object007_tiggy_manual_bake_0", [0.261, 1.554, 0.785], 3.1404, 0.564],
  ["s3", "Corridor, right wall 3", "Object010_squirrel_manual_bake_0", [2.854, 1.532, 0.79], -3.1415, 0.647],
  ["s4", "Corridor, right wall 4", "Loveknot_and_tess_Loveknot_Manual_Bake_0", [5.384, 1.557, 0.785], -3.1416, 0.556],
  ["s5", "Corridor, right wall 5", "Object005_squirrel_manual_bake_0", [7.843, 1.532, 0.79], -3.1415, 0.647],
  ["e1", "East room, right of the corridor", "jakeframe_jake_manua_bake_0", [8.717, 1.573, 1.328], 1.9199, 0.65],
  ["e2", "East room, by the window", "Eddie_and_horse_propinquity_early_manual_bake_0", [12.801, 1.645, 3.831], -3.0511, 0.778],
  ["e3", "East room, right of the door", "Object003_eddie_manuel_bake_0", [14.782, 1.59, 2.988], -2.4874, 1.102],
  ["e4", "East room, left of the corridor", "jake_and_london_eye_london_eye_manual_bake_0", [10.327, 1.474, -3.446], 0.5244, 1.069],
];
export const SPOTS: Spot[] = SPOT_ROWS.map(([id, label, original, position, rotation, w]) => ({ id, label, original, position, rotation, w }));

// Furniture you can't walk through: [x, z, radius] (tables, plants, the two benches in the east room).
export const OBSTACLES: [number, number, number][] = [[-8.9, 0, 0.6], [11.15, 0.95, 0.6], [-5.5, 1.0, 0.35], [9.0, -1.46, 0.35], [11.5, -2.0, 0.55], [13.3, 1.4, 0.55]];

// Can you stand here (eye at least `margin` from any wall or obstacle)?
export function walkable(x: number, z: number, margin = 0.35): boolean {
  if (OBSTACLES.some(([ox, oz, r]) => Math.hypot(x - ox, z - oz) < r)) return false;
  const inRoom = Object.values(ROOMS).some((c) => Math.hypot(x - c.x, z - c.z) < R - margin);
  const inCorridor = z > CORRIDOR.north + margin && z < CORRIDOR.south - margin && x > ROOMS.west.x && x < ROOMS.east.x;
  return inRoom || inCorridor;
}

export const START = { position: [-11.2, 1.6, 1.2] as Vec3, yaw: 76 }; // west room, looking down the corridor
