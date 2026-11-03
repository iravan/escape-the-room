import { create } from "zustand";
import { persist } from "zustand/middleware";

// The on-screen move stick (touch screens): −1…1 sideways and forward, read every frame like held WASD keys.
export const stick = { x: 0, y: 0 };
export type Vec3 = [number, number, number];

// A key belongs to a field only while typing in it. A focused slider (it keeps focus after a drag) only keeps its arrows,
// so WASD and the shortcuts still work after touching the volume.
export const typing = (e: KeyboardEvent) =>
  e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLInputElement && (e.target.type !== "range" || e.key.startsWith("Arrow")));

// Room coordinates are Unity's with z flipped (three is right-handed): Unity (x, y, z) = three (x, y, -z).
type State = {
  yaw: number; // degrees, Unity convention: +90 looks along +x
  pitch: number; // degrees, + looks down, clamped ±60
  roomPos: Vec3;
  sensitivity: number;
  preset: number; // index into PRESETS (lib/lighting.ts)
  lamp: boolean;
  quality: 0 | 1 | 2; // low, medium, high
  blanket: number; // which of the style's duvet covers is on the bed (clicking the bed cycles it)
  nextBlanket: () => void;
  setQuality: (q: 0 | 1 | 2) => void;
  cyclePreset: () => void;
  toggleLamp: () => void;
  hint: string; // hover tooltip
  title: boolean; // title screen showing (every load)
  hideUI: boolean; // showcase mode
  dialog: "" | "settings" | "controls";
  look: (dYaw: number, dPitch: number) => void;
  setRoomPos: (p: Vec3) => void;
};

export const useGame = create<State>()(
  persist(
    (set) => ({
      yaw: -42, // desk and PC just in frame on the left
      pitch: 10,
      roomPos: [1.3, 1.55, 1.5],
      sensitivity: 1,
      preset: 0,
      lamp: true,
      quality: 2,
      blanket: 0,
      nextBlanket: () => set((s) => ({ blanket: (s.blanket + 1) % 4 })),
      setQuality: (quality) => set({ quality }),
      cyclePreset: () => set((s) => ({ preset: (s.preset + 1) % 3 })),
      toggleLamp: () => set((s) => ({ lamp: !s.lamp })),
      hint: "",
      title: true,
      hideUI: false,
      dialog: "",
      look: (dYaw, dPitch) => set((s) => ({ yaw: s.yaw + dYaw, pitch: Math.min(60, Math.max(-60, s.pitch + dPitch)) })),
      setRoomPos: (p) => set({ roomPos: p }),
    }),
    { name: "my-gallery", partialize: ({ yaw, pitch, roomPos, sensitivity, preset, lamp, quality, blanket }) => ({ yaw, pitch, roomPos, sensitivity, preset, lamp, quality, blanket }) },
  ),
);
