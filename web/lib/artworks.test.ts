import { describe, expect, it } from "vitest";
import { ARTWORKS, normalizeArtworks, parseDimensions } from "./artworks";
import { SPOTS, walkable } from "./gallery";

describe("artworks config", () => {
  it("fills defaults from the spot, drops bad entries, keeps ids and spots unique", () => {
    const a = normalizeArtworks({ artworks: [
      { image: "a.jpg", spot: "n2" },
      { image: "../secret.jpg" },
      { title: "no image" },
      { id: "x", image: "b.png", spot: "n2", year: 2020 }, // spot taken → next free one
      { id: "x", image: "c.png", spot: "nowhere", width: 9 },
    ] });
    expect(a.map((x) => x.id)).toEqual(["a.jpg", "x", "x-2"]);
    expect(a.map((x) => x.spot.id)).toEqual(["n2", "w1", "w2"]);
    const n2 = SPOTS.find((s) => s.id === "n2")!;
    expect(a[0]).toMatchObject({ title: "a.jpg", width: n2.w, height: n2.position[1] });
    expect(a[1].year).toBe("2020");
    expect(a[2].width).toBe(2);
    expect(normalizeArtworks(null)).toEqual([]);
  });

  it("stops when every spot is taken", () => {
    const many = Array.from({ length: SPOTS.length + 3 }, (_, i) => ({ image: `${i}.jpg` }));
    expect(normalizeArtworks({ artworks: many }).length).toBe(SPOTS.length);
  });

  it("reads real sizes, height × width, into metres", () => {
    expect(parseDimensions("73.7 × 92.1 cm")).toEqual([0.921, 0.737]);
    expect(parseDimensions("10 x 20 in")).toEqual([0.508, 0.254]);
    expect(parseDimensions("500 × 600 mm")).toEqual([0.6, 0.5]);
    expect(parseDimensions("")).toBeNull();
    expect(parseDimensions("9000 × 9000 cm")).toBeNull();
    expect(normalizeArtworks({ artworks: [{ image: "a.jpg", dimensions: "50 × 40 cm" }] })[0].size).toEqual([0.4, 0.5]);
  });

  it("loads the shipped config", () => {
    expect(ARTWORKS.length).toBeGreaterThan(0);
  });
});

describe("floor plan", () => {
  it("lets you walk the rooms and corridor but not through walls or tables", () => {
    expect(walkable(-11.2, 1.2)).toBe(true); // start
    expect(walkable(2, -0.1)).toBe(true); // corridor
    expect(walkable(14, 2)).toBe(true); // east room
    expect(walkable(2, 1.5)).toBe(false); // behind the corridor wall
    expect(walkable(-8.9, 0)).toBe(false); // table
    expect(walkable(-13, 0)).toBe(false); // outside
  });
});
