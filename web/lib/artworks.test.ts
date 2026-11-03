import { describe, expect, it } from "vitest";
import { ARTWORKS, normalizeArtworks } from "./artworks";

describe("artworks config", () => {
  it("fills defaults, drops bad entries, keeps ids unique", () => {
    const a = normalizeArtworks({ artworks: [
      { image: "a.jpg" },
      { image: "../secret.jpg" },
      { title: "no image" },
      { id: "x", image: "b.png", wall: "left", at: 1, year: 2020 },
      { id: "x", image: "c.png", wall: "ceiling", width: -3 },
    ] });
    expect(a.map((x) => x.id)).toEqual(["a.jpg", "x", "x-4"]);
    expect(a[0]).toMatchObject({ title: "a.jpg", wall: "back", at: 0, height: 1.5, width: 0.6 });
    expect(a[1]).toMatchObject({ wall: "left", at: 1, year: "2020" });
    expect(a[2]).toMatchObject({ wall: "back", width: 0.1 });
    expect(normalizeArtworks(null)).toEqual([]);
  });

  it("loads the shipped config", () => {
    expect(ARTWORKS.length).toBeGreaterThan(0);
  });
});
