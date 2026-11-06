"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { START } from "@/lib/gallery";
import { LANGS, MISSING, resetToTitle, tapHole, usePuzzle, wrong } from "@/lib/puzzle";
import { useGame } from "@/lib/store";

const piece = "flex aspect-square items-center justify-center rounded-full text-xl text-background shadow-md sm:text-2xl";

export function PuzzleDialog() {
  const open = useGame((s) => s.dialog === "puzzle");
  const { placed, pick, pieces, holes, lang } = usePuzzle();
  const close = () => useGame.setState({ dialog: "" });
  if (!lang) return null;
  const pack = LANGS[lang], rows = pack.vowels.length, headers = ["", ...pack.columns];
  const used = Object.values(placed), tray = pieces.filter((p) => !used.includes(p));
  const full = holes.every((i) => placed[i]), bad = full ? wrong(placed, holes, lang) : [];
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{pack.chartTitle}</DialogTitle>
          <p className="text-muted-foreground">
            {MISSING} {pack.unit}s are missing (a new set each game). {pack.puzzleHint}
          </p>
        </DialogHeader>
        <div
          className="gap-0.5 rounded bg-[#f6efdf] p-1.5 text-center text-[#2b2b2d]"
          style={{ display: "grid", gridTemplateColumns: `auto repeat(${pack.columns.length}, minmax(0, 1fr))` }}
        >
          {headers.map((c, x) => <div key={`h${x}`} className="text-xs font-semibold text-wood">{x ? c || "–" : ""}</div>)}
          {pack.vowels.map((v, y) => [
            <div key={v} className="flex items-center pr-1 text-xs font-semibold text-wood">{v}</div>,
            ...pack.columns.map((_, x) => {
              const i = x * rows + y, c = pack.chart[i];
              if (!c) return <div key={`${x}-${y}`} />;
              if (!holes.includes(i)) return (
                <div key={i} className="flex aspect-square flex-col items-center justify-center border border-[#b9ab92] leading-none">
                  <span className="text-lg sm:text-2xl">{c.char}</span><span className="text-[9px] text-muted-foreground sm:text-[10px]">{c.romaji}</span>
                </div>
              );
              const p = placed[i];
              return (
                <button key={i} aria-label={p ? `${p}, take back` : "Empty hole"} onClick={() => tapHole(i)}
                  className={`flex aspect-square items-center justify-center border border-[#b9ab92] p-0.5 ${pick ? "cursor-pointer bg-wood/15 ring-1 ring-wood" : ""}`}>
                  {p ? <span className={`${piece} size-full ${bad.includes(i) ? "bg-destructive" : "bg-wood"}`}>{p}</span> : <span className="size-4/5 rounded-sm bg-[#3a3330]" />}
                </button>
              );
            }),
          ])}
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-wood">
            {bad.length ? `${bad.length} pieces are in the wrong place` : tray.length ? "Pieces: pick one, then tap a hole" : ""}
          </p>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-15">
            {tray.map((p) => (
              <button key={p} aria-pressed={pick === p} onClick={() => usePuzzle.setState({ pick: pick === p ? "" : p })}
                className={`${piece} bg-wood ${pick === p ? "-translate-y-1 ring-4 ring-ring/40" : ""}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {bad.length > 0 && (
            <Button variant="destructive" onClick={() => usePuzzle.setState({ placed: {}, pick: "" })}>Try again</Button>
          )}
          <Button variant={bad.length ? "outline" : "default"} onClick={close}>Back to the gallery [Esc]</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Escaped() {
  const { holes, lang } = usePuzzle();
  const again = () => {
    resetToTitle();
    useGame.setState({ dialog: "", roomPos: START.position, yaw: START.yaw, pitch: 4, title: true });
  };
  if (!lang) return null;
  const pack = LANGS[lang], learned = holes.map((i) => pack.chart[i]!);
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 overflow-y-auto bg-background/85 p-6 text-center backdrop-blur">
      <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">The door clicks open</p>
      <h1 className="text-5xl font-light uppercase tracking-[0.2em] sm:text-7xl">You escaped!</h1>
      <p className="text-2xl text-wood">{pack.congrats}</p>
      <div className="grid max-w-xl grid-cols-5 gap-2 sm:grid-cols-8">
        {learned.map((c) => <div key={c.char} className="rounded border border-border bg-card px-2 py-1"><div className="text-2xl">{c.char}</div><div className="text-xs text-muted-foreground">{c.romaji}</div></div>)}
      </div>
      <p className="text-muted-foreground">You learned {learned.length} {pack.unit}s.</p>
      <Button size="lg" className="h-12 px-8 text-lg" onClick={again}>Play again</Button>
    </div>
  );
}
