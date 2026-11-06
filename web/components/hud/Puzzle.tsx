"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { START } from "@/lib/gallery";
import { CHART, COLUMNS, MISSING, fresh, tapHole, usePuzzle, VOWELS, wrong } from "@/lib/puzzle";
import { useGame } from "@/lib/store";

const piece = "flex aspect-square items-center justify-center rounded-full text-xl text-background shadow-md sm:text-2xl";

// The hiragana chart up close: take a piece from the tray, tap a hole to put it there; tap a placed piece to take it back.
// Once every hole is filled, wrong pieces turn red.
export function PuzzleDialog() {
  const open = useGame((s) => s.dialog === "puzzle"), { placed, pick, pieces, holes } = usePuzzle();
  const close = () => useGame.setState({ dialog: "" });
  const used = Object.values(placed), tray = pieces.filter((p) => !used.includes(p));
  const full = holes.every((i) => placed[i]), bad = full ? wrong(placed, holes) : [];
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">ひらがな — the hiragana chart</DialogTitle>
          <p className="text-muted-foreground">
            {MISSING} kana are missing (a new set each game). Columns are consonants, rows are vowels: <b>か</b> sits where <b>k</b> meets <b>a</b>.
            The plaques under the paintings tell you which kana makes which sound.
          </p>
        </DialogHeader>
        <div className="grid grid-cols-[auto_repeat(11,minmax(0,1fr))] gap-0.5 rounded bg-[#f6efdf] p-1.5 text-center text-[#2b2b2d]">
          {["", ...COLUMNS].map((c, x) => <div key={x} className="text-xs font-semibold text-wood">{x ? c || "–" : ""}</div>)}
          {VOWELS.map((v, y) => [
            <div key={v} className="flex items-center pr-1 text-xs font-semibold text-wood">{v}</div>,
            ...COLUMNS.map((_, x) => {
              const i = x * 5 + y, c = CHART[i];
              if (!c) return <div key={i} />;
              if (!holes.includes(i)) return (
                <div key={i} className="flex aspect-square flex-col items-center justify-center border border-[#b9ab92] leading-none">
                  <span className="text-lg sm:text-2xl">{c.kana}</span><span className="text-[9px] text-muted-foreground sm:text-[10px]">{c.romaji}</span>
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

// The end: the chart is complete, the door opens. Recaps the kana learned; Play again deals a new random set at the entrance.
export function Escaped() {
  const holes = usePuzzle((s) => s.holes);
  const again = () => {
    fresh();
    useGame.setState({ dialog: "", roomPos: START.position, yaw: START.yaw, pitch: 4, title: true });
  };
  const learned = holes.map((i) => CHART[i]!);
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 overflow-y-auto bg-background/85 p-6 text-center backdrop-blur">
      <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">The door clicks open</p>
      <h1 className="text-5xl font-light uppercase tracking-[0.2em] sm:text-7xl">You escaped!</h1>
      <p className="text-2xl text-wood">おめでとう <span className="text-base text-muted-foreground">(omedetou, congratulations)</span></p>
      <div className="grid max-w-xl grid-cols-5 gap-2 sm:grid-cols-8">
        {learned.map((c) => <div key={c.kana} className="rounded border border-border bg-card px-2 py-1"><div className="text-2xl">{c.kana}</div><div className="text-xs text-muted-foreground">{c.romaji}</div></div>)}
      </div>
      <p className="text-muted-foreground">You learned {learned.length} hiragana.</p>
      <Button size="lg" className="h-12 px-8 text-lg" onClick={again}>Play again</Button>
    </div>
  );
}
