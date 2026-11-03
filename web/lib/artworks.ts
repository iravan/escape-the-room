import { create } from "zustand";
import config from "@/public/artworks/artworks.json";

// The gallery's artworks: images in public/artworks/, described in public/artworks/artworks.json (see its README).
// Placement: `wall` (back | front | left | right), `at` = metres from the wall's centre (+ = to your right as you face
// it), `height` = centre height in metres, `width` in metres (height follows the image's aspect).
export type Wall = "back" | "front" | "left" | "right";
export type Artwork = {
  id: string; image: string; title: string; artist: string; year: string; medium: string; description: string;
  wall: Wall; at: number; height: number; width: number;
};

const WALLS: Wall[] = ["back", "front", "left", "right"];
const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? v : d);

// Hand-edited config: skip entries without an image, fill defaults for the rest, keep ids unique.
export function normalizeArtworks(raw: unknown): Artwork[] {
  const list = (raw as { artworks?: unknown })?.artworks;
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  return list.flatMap((a: Record<string, unknown>, i) => {
    const image = str(a?.image);
    if (!image || /[\\]|\.\./.test(image)) return [];
    let id = str(a.id) || image;
    if (seen.has(id)) id = `${id}-${i}`;
    seen.add(id);
    return [{
      id, image, title: str(a.title) || image, artist: str(a.artist), year: String(a.year ?? ""), medium: str(a.medium),
      description: str(a.description), wall: WALLS.includes(a.wall as Wall) ? (a.wall as Wall) : "back",
      at: num(a.at, 0), height: num(a.height, 1.5), width: Math.max(0.1, num(a.width, 0.6)),
    }];
  });
}

export const ARTWORKS = normalizeArtworks(config);
export const artworkUrl = (a: Artwork) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/artworks/${a.image}`;

// The artwork whose description is open ("" = none).
export const useArtwork = create<{ open: string }>(() => ({ open: "" }));
