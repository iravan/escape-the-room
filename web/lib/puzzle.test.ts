import { describe, expect, it } from "vitest";
import { ARTWORKS } from "./artworks";
import { LANGS, MISSING, deal, fresh, solved, start, tapHole, usePuzzle, wrong, type Lang } from "./puzzle";

const seq = (vals: number[]) => { let i = 0; return () => vals[i++ % vals.length]!; };

describe.each(["ja", "ko"] as Lang[])("%s chart puzzle", (lang) => {
  it("has a full chart with a clue for every glyph, and deals one hole per painting", () => {
    const { chart, clues } = LANGS[lang];
    expect(chart.filter(Boolean).length).toBeGreaterThanOrEqual(MISSING);
    for (const c of chart) if (c) expect(clues[c.char]).toMatch(new RegExp(`${c.char} =`));
    expect(MISSING).toBe(ARTWORKS.length);

    const r = deal(lang, MISSING, seq([0.1, 0.9, 0.2, 0.8, 0.3, 0.7, 0.4, 0.6, 0.5]));
    expect(r.pieces).toHaveLength(MISSING);
    expect(r.holes).toHaveLength(MISSING);
    expect(r.clues).toHaveLength(MISSING);
    expect(new Set(r.pieces).size).toBe(MISSING);
    for (const i of r.holes) expect(r.pieces).toContain(chart[i]!.char);
  });
});

describe("language start and escape", () => {
  it("starts a language deal and escapes only when every piece is right", () => {
    start("ja", seq([0.2, 0.4, 0.6, 0.8, 0.1, 0.3, 0.5, 0.7, 0.9]));
    const { holes, pieces, lang } = usePuzzle.getState();
    expect(lang).toBe("ja");
    expect(pieces).toHaveLength(MISSING);

    const chart = LANGS.ja.chart;
    const right = Object.fromEntries(holes.map((i) => [i, chart[i]!.char]));
    expect(solved(right, holes, "ja")).toBe(true);
    const [a, b] = holes, swapped = { ...right, [a]: right[b], [b]: right[a] };
    expect(solved(swapped, holes, "ja")).toBe(false);
    expect(wrong(swapped, holes, "ja")).toEqual([a, b]);

    usePuzzle.setState({ placed: { ...right, [a]: undefined! }, pick: chart[a]!.char, escaped: false });
    tapHole(a);
    expect(usePuzzle.getState()).toMatchObject({ pick: "", escaped: true });

    const before = usePuzzle.getState().pieces.join("");
    fresh(seq([0.9, 0.1, 0.8, 0.2, 0.7, 0.3, 0.6, 0.4, 0.5]));
    expect(usePuzzle.getState().pieces.join("")).not.toBe(before);
  });

  it("korean deal differs from japanese glyphs", () => {
    const ja = deal("ja", MISSING, () => 0.3).pieces.join("");
    const ko = deal("ko", MISSING, () => 0.3).pieces.join("");
    expect(ja).not.toBe(ko);
  });
});
