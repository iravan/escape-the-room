import { create } from "zustand";
import config from "@/public/artworks/artworks.json";
import { SPOTS, type Spot } from "./gallery";

// The gallery's artworks: images in public/artworks/, described in public/artworks/artworks.json (see its README).
// Each hangs in a spot (lib/gallery.ts SPOTS: w1–w4 west room, n1–n5 / s1–s5 corridor, e1–e4 east room);
// without one it takes the next free spot. `width` is the frame's width in metres, `height` its centre height.
export type Artwork = {
  id: string; image: string; title: string; artist: string; year: string; medium: string; description: string;
  spot: Spot; width: number; height: number;
};

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

// Hand-edited config: skip entries without an image, keep ids and spots unique, fill defaults from the spot.
export function normalizeArtworks(raw: unknown): Artwork[] {
  const list = (raw as { artworks?: unknown })?.artworks;
  if (!Array.isArray(list)) return [];
  const entries = list.filter((a): a is Record<string, unknown> => !!a && typeof a === "object" && !!str(a.image) && !/[\\]|\.\./.test(str(a.image)));
  const taken = new Set<string>(), ids = new Set<string>();
  const wanted = entries.map((a) => { const s = SPOTS.find((x) => x.id === a.spot && !taken.has(x.id)); if (s) taken.add(s.id); return s; });
  return entries.flatMap((a, i) => {
    const spot = wanted[i] ?? SPOTS.find((x) => !taken.has(x.id));
    if (!spot) return []; // more artworks than spots
    taken.add(spot.id);
    const image = str(a.image);
    let id = str(a.id) || image;
    if (ids.has(id)) id = `${id}-${i}`;
    ids.add(id);
    return [{
      id, image, spot, title: str(a.title) || image, artist: str(a.artist), year: String(a.year ?? ""), medium: str(a.medium),
      description: str(a.description), width: Math.min(2, Math.max(0.2, num(a.width) ?? spot.w)), height: num(a.height) ?? spot.position[1],
    }];
  });
}

export const ARTWORKS = normalizeArtworks(config);
export const artworkUrl = (a: Artwork) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/artworks/${a.image}`;

// The artwork whose description is open ("" = none).
export const useArtwork = create<{ open: string }>(() => ({ open: "" }));
