import { create } from "zustand";
import config from "@/public/artworks/artworks.json";
import { SPOTS, type Spot } from "./gallery";

// The gallery's artworks: images in public/artworks/, described in public/artworks/artworks.json (see its README).
// Each hangs in a spot (lib/gallery.ts SPOTS: w1–w4 west room, n1–n5 / s1–s5 corridor, e1–e4 east room);
// without one it takes the next free spot. `width` is the frame's width in metres, `height` its centre height.
// Like a museum guide: a short `description` and a longer `details` text, both shown in its panel;
// `number` is its catalogue number, in config order.
export type Artwork = {
  id: string; number: number; image: string; title: string; artist: string; artistInfo: string; year: string; medium: string;
  dimensions: string; collection: string; description: string; details: string; spot: Spot; width: number; height: number;
  size: [number, number] | null; // the real picture, width × height in metres, from `dimensions`
};
export type Exhibition = { title: string; subtitle: string; intro: string };

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

// Museum dimensions, height × width as catalogues write them ("73.7 × 92.1 cm", "29 x 36 in", "500 × 600 mm") →
// [width, height] in metres; anything else (or an implausible size) → null.
const UNIT: Record<string, number> = { mm: 0.001, cm: 0.01, m: 1, in: 0.0254 };
export function parseDimensions(s: string): [number, number] | null {
  const m = /([\d.]+)\s*[×x]\s*([\d.]+)\s*(mm|cm|m|in)\b/i.exec(s);
  if (!m) return null;
  const k = UNIT[m[3].toLowerCase()], mm = (v: string) => Math.round(+v * k * 1000) / 1000, h = mm(m[1]), w = mm(m[2]);
  return w >= 0.05 && h >= 0.05 && w <= 3 && h <= 3 ? [w, h] : null;
}

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
      id, number: i + 1, image, spot, title: str(a.title) || image, artist: str(a.artist), artistInfo: str(a.artistInfo),
      year: String(a.year ?? ""), medium: str(a.medium), dimensions: str(a.dimensions), collection: str(a.collection),
      description: str(a.description), details: str(a.details), size: parseDimensions(str(a.dimensions)), width: Math.min(2, Math.max(0.2, num(a.width) ?? spot.w)), height: num(a.height) ?? spot.position[1],
    }];
  });
}

export const ARTWORKS = normalizeArtworks(config);
const ex = ((config as { exhibition?: Record<string, unknown> }).exhibition ?? {}) as Record<string, unknown>;
export const EXHIBITION: Exhibition = { title: str(ex.title) || "My Gallery", subtitle: str(ex.subtitle), intro: str(ex.intro) };
export const artworkUrl = (a: Artwork) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/artworks/${a.image}`;

// The artwork whose description is open ("" = none).
export const useArtwork = create<{ open: string }>(() => ({ open: "" }));
