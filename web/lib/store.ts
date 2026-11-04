import { create } from "zustand";
import { persist } from "zustand/middleware";
import { START } from "./gallery";

// The on-screen move stick (touch screens): −1…1 sideways and forward, read every frame like held WASD keys.
export const stick = { x: 0, y: 0 };
export type Vec3 = [number, number, number];

// A key belongs to a field only while typing in it. A focused slider (it keeps focus after a drag) only keeps its arrows,
// so WASD and the shortcuts still work after touching the volume.
export const typing = (e: KeyboardEvent) =>
  e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLInputElement && (e.target.type !== "range" || e.key.startsWith("Arrow")));

type State = {
  yaw: number; // degrees, Unity convention: +90 looks along +x
  pitch: number; // degrees, + looks down, clamped ±60
  roomPos: Vec3;
  sensitivity: number;
  quality: 0 | 1 | 2; // low, medium, high
  setQuality: (q: 0 | 1 | 2) => void;
  hint: string; // hover tooltip
  title: boolean; // title screen showing (every load)
  hideUI: boolean; // showcase mode
  menu: boolean; // touch screens: menu panel shown (not saved)
  dialog: "" | "settings" | "controls" | "about";
  look: (dYaw: number, dPitch: number) => void;
  setRoomPos: (p: Vec3) => void;
};

export const useGame = create<State>()(
  persist(
    (set) => ({
      yaw: START.yaw,
      pitch: 4,
      roomPos: START.position,
      sensitivity: 1,
      quality: 2,
      setQuality: (quality) => set({ quality }),
      hint: "",
      title: true,
      hideUI: false,
      menu: false,
      dialog: "",
      look: (dYaw, dPitch) => set((s) => ({ yaw: s.yaw + dYaw, pitch: Math.min(60, Math.max(-60, s.pitch + dPitch)) })),
      setRoomPos: (p) => set({ roomPos: p }),
    }),
    // version 1: the gallery building; a save from the old bedroom starts fresh at the entrance.
    { name: "my-gallery", version: 1, migrate: () => ({}), partialize: ({ yaw, pitch, roomPos, sensitivity, quality }) => ({ yaw, pitch, roomPos, sensitivity, quality }) },
  ),
);
