import type { Vec3 } from "./store";

// Where things stand, in metres (three coords = Unity's with z negated). Room is 4 × 2.8 × 4, centred on x/z.
export const CUBBY = 0.33, BOARD = 0.02, COLS = 4, ROWS = 2;
export const CABINET_W = COLS * CUBBY + (COLS + 1) * BOARD;
export const CABINET_H = ROWS * CUBBY + (ROWS + 1) * BOARD;
export const CABINET: Vec3 = [1.26, 0, -1.8];
export const BED_HOME: Vec3 = [-1.45, 0, -0.9];
export const NIGHTSTAND: Vec3 = [-1.7, 0, 0.45];
export const DESK: Vec3 = [-1.68, 0, 1.35];
