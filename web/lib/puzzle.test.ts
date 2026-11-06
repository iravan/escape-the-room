import { describe, expect, it } from "vitest";
import { ARTWORKS } from "./artworks";
import { CHART, CLUES, MISSING, deal, fresh, solved, tapHole, usePuzzle, wrong } from "./puzzle";

// Fixed sequence so deals are reproducible in tests.
const seq = (vals: number[]) => { let i = 0; return () => vals[i++ % vals.length]!; };

describe("hiragana chart puzzle", () => {
  it("has the 46 kana, a clue for each, and deals one hole per painting", () => {
    expect(CHART.filter(Boolean).length).toBe(46);
    expect(CHART[1]).toEqual({ kana: "い", romaji: "i" });
    for (const c of CHART) if (c) expect(CLUES[c.kana]).toMatch(new RegExp(`${c.kana} =`));
    expect(MISSING).toBe(ARTWORKS.length);

    const r = deal(MISSING, seq([0.1, 0.9, 0.2, 0.8, 0.3, 0.7, 0.4, 0.6, 0.5]));
    expect(r.pieces).toHaveLength(MISSING);
    expect(r.holes).toHaveLength(MISSING);
    expect(r.clues).toHaveLength(MISSING);
    expect(new Set(r.pieces).size).toBe(MISSING);
    for (const i of r.holes) expect(r.pieces).toContain(CHART[i]!.kana);
    for (const clue of r.clues) expect(Object.values(CLUES)).toContain(clue);
  });

  it("picks a different set when the RNG differs", () => {
    const a = deal(MISSING, () => 0.1).pieces.join("");
    const b = deal(MISSING, () => 0.9).pieces.join("");
    expect(a).not.toBe(b);
  });

  it("escapes only when every piece is in its own hole, and Play again deals fresh", () => {
    fresh(seq([0.2, 0.4, 0.6, 0.8, 0.1, 0.3, 0.5, 0.7, 0.9]));
    const { holes, pieces } = usePuzzle.getState();
    expect(pieces).toHaveLength(MISSING);

    const right = Object.fromEntries(holes.map((i) => [i, CHART[i]!.kana]));
    expect(solved(right, holes)).toBe(true);
    const [a, b] = holes, swapped = { ...right, [a]: right[b], [b]: right[a] };
    expect(solved(swapped, holes)).toBe(false);
    expect(wrong(swapped, holes)).toEqual([a, b]);

    usePuzzle.setState({ placed: { ...right, [a]: undefined! }, pick: CHART[a]!.kana, escaped: false });
    tapHole(a);
    expect(usePuzzle.getState()).toMatchObject({ pick: "", escaped: true });
    tapHole(a); // empty hand: takes the piece back
    expect(usePuzzle.getState().placed[a]).toBeUndefined();

    const before = usePuzzle.getState().pieces.join("");
    fresh(seq([0.9, 0.1, 0.8, 0.2, 0.7, 0.3, 0.6, 0.4, 0.5]));
    expect(usePuzzle.getState().pieces.join("")).not.toBe(before);
    expect(usePuzzle.getState()).toMatchObject({ placed: {}, pick: "", escaped: false });
  });
});
