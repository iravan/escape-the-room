"use client";

import { useEffect } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { typing, useGame } from "@/lib/store";
import { takePhoto } from "@/lib/photo";
import { EXHIBITION } from "@/lib/artworks";
import { LANGS, type Lang, start, usePuzzle } from "@/lib/puzzle";
import { Panel } from "./Panel";
import { Escaped, PuzzleDialog } from "./Puzzle";

const one = (v: number | readonly number[]) => (Array.isArray(v) ? v[0] : v) as number;

function pickLang(lang: Lang) {
  start(lang);
  // Next tick so this click doesn't also fall through into the room.
  queueMicrotask(() => useGame.setState({ title: false }));
}

// Title: choose Japanese or Korean, then enter the gallery.
function Title() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background/60 p-4 text-center backdrop-blur-[2px]">
      <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">A language puzzle game</p>
      <h1 className="text-5xl font-light uppercase tracking-[0.2em] text-foreground sm:text-7xl">{EXHIBITION.title}</h1>
      <div className="h-1 w-40 bg-foreground" />
      <p className="text-lg text-wood">Learn Japanese or Korean to get out</p>
      <p className="max-w-md text-sm text-muted-foreground">Choose a language to learn. Painting plaques and the chart puzzle will teach that script.</p>
      <div className="mt-4 flex w-full max-w-lg flex-col gap-2 sm:flex-row">
        <Button size="lg" className="h-14 flex-1 text-lg font-bold" onClick={(e) => { e.stopPropagation(); pickLang("ja"); }}>
          {LANGS.ja.label}
        </Button>
        <Button size="lg" variant="outline" className="h-14 flex-1 border-2 border-wood text-lg font-bold text-wood" onClick={(e) => { e.stopPropagation(); pickLang("ko"); }}>
          {LANGS.ko.label}
        </Button>
      </div>
    </div>
  );
}

function LeftPanel() {
  const open = useGame((s) => s.menu);
  const lang = usePuzzle((s) => s.lang), holes = usePuzzle((s) => s.holes);
  const placed = usePuzzle((s) => s.holes.filter((i) => s.placed[i]).length);
  const pack = lang ? LANGS[lang] : null;
  const toggle = () => useGame.setState({ menu: !open });
  return (
    <>
    <Button size="icon" variant="outline" aria-label={open ? "Hide menu" : "Show menu"} aria-expanded={open} onClick={toggle}
      className="fixed right-2.5 top-2.5 hidden bg-background/90 shadow-md [@media(pointer:coarse)]:inline-flex">
      {open ? <XIcon /> : <MenuIcon />}
    </Button>
    <Panel side="left" className={`[@media(pointer:coarse)]:left-auto [@media(pointer:coarse)]:right-2.5 [@media(pointer:coarse)]:top-14 [@media(pointer:coarse)]:max-h-[calc(100dvh-4.5rem)] ${open ? "" : "[@media(pointer:coarse)]:hidden"}`}>
      <p>
        <b className="text-wood">{EXHIBITION.title}</b>
        {pack && <><br /><span className="text-xs">{pack.label}</span></>}
        <br /><span className="text-muted-foreground">{pack?.help ?? ""}</span>
      </p>
      <p className="font-semibold">Chart: {placed} / {holes.length} {pack?.unit ?? "piece"}s placed</p>
      <p className="text-[11px] leading-snug text-muted-foreground">
        Gallery: <a className="underline" href="https://sketchfab.com/3d-models/richards-art-gallery-audio-tour-0e3e19faa6474fd5974e6a7ed1b221d8" target="_blank" rel="noreferrer">Richard&apos;s Art Gallery – Audio Tour</a> by{" "}
        <a className="underline" href="https://sketchfab.com/shinymagic" target="_blank" rel="noreferrer">shinymagic</a>,{" "}
        <a className="underline" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> (optimised)
      </p>
      <div className="grid gap-1">
        <Button size="sm" onClick={() => useGame.setState({ dialog: "about" })}>How to escape</Button>
        <Button size="sm" variant="outline" onClick={takePhoto}>Photo [P]</Button>
        <Button size="sm" variant="outline" onClick={() => useGame.setState({ hideUI: true })}>Showcase mode [H]</Button>
        <div className="grid grid-cols-2 gap-1">
          <Button size="sm" variant="outline" onClick={() => useGame.setState({ dialog: "settings" })}>Settings</Button>
          <Button size="sm" variant="outline" onClick={() => useGame.setState({ dialog: "controls" })}>Controls [?]</Button>
        </div>
      </div>
    </Panel>
    </>
  );
}

function Dialogs() {
  const dialog = useGame((s) => s.dialog), sensitivity = useGame((s) => s.sensitivity), quality = useGame((s) => s.quality);
  const lang = usePuzzle((s) => s.lang), pack = lang ? LANGS[lang] : LANGS.ja;
  const close = () => useGame.setState({ dialog: "" });
  const controls: [string, string][] = [
    ["Everywhere", "P photo · H hide UI (Show controls brings it back) · ? this help"],
    ["Room", "Drag to look, WASD or arrows to move (double-tap a move key to run), click anything that lights up."],
    ["Notebook", "On the table by the blue door (east room). Click it for the escape instructions — you need to solve the puzzle."],
    ["Paintings", `Each painting has a plaque under it with a ${lang === "ko" ? "Korean" : "Japanese"} word and one ${pack.unit}. Walk up and read it — paintings are not clickable.`],
    ["Chart", pack.controlsChart],
    ["Touch screens", "Tap = click, drag = look, the stick at the bottom left = walk (drag past the circle to run), ☰ (top right) shows or hides the menu. Every panel has a button to close it, no keyboard needed."],
  ];
  return (
    <>
      <Dialog open={dialog === "about"} onOpenChange={(o) => { if (!o) close(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">How to escape</p>
            <DialogTitle className="text-2xl font-light uppercase tracking-[0.15em]">{EXHIBITION.title}</DialogTitle>
            <p className="text-wood">{pack.label}</p>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{pack.notebook}</p>
          <Button onClick={close}>Back to the gallery</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={dialog === "notebook"} onOpenChange={(o) => { if (!o) close(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Found in the gallery</p>
            <DialogTitle className="text-2xl font-light uppercase tracking-[0.15em]">Notebook</DialogTitle>
            <p className="font-semibold text-wood">You need to solve the puzzle to escape.</p>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{pack.notebook}</p>
          <Button onClick={close}>Close [Esc]</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={dialog === "controls"} onOpenChange={(o) => { if (!o) close(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Controls</DialogTitle></DialogHeader>
          <dl className="space-y-2 text-sm">
            {controls.map(([h, t]) => <div key={h}><dt className="font-bold text-wood">{h}</dt><dd className="text-muted-foreground">{t}</dd></div>)}
          </dl>
          <Button onClick={close}>Close</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={dialog === "settings"} onOpenChange={(o) => { if (!o) close(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Settings</DialogTitle></DialogHeader>
          <label className="grid gap-2">Mouse sensitivity: {sensitivity.toFixed(1)}×
            <Slider min={0.2} max={3} step={0.1} value={[sensitivity]} onValueChange={(v) => useGame.setState({ sensitivity: one(v) })} />
          </label>
          <div className="grid gap-2">Graphics
            <div className="grid grid-cols-3 gap-1">
              {(["Low", "Medium", "High"] as const).map((q, i) => (
                <Button key={q} size="sm" variant={quality === i ? "default" : "outline"} onClick={() => useGame.getState().setQuality(i as 0 | 1 | 2)}>{q}</Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Low: no glow, no shadows. High: glow, soft shadows, smoothing.</p>
          </div>
          <Button onClick={close}>Close</Button>
        </DialogContent>
      </Dialog>
      <PuzzleDialog />
    </>
  );
}

// Keys outside dialogs: H, P, ?. Title only leaves via the language buttons.
function useHudKeys() {
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (typing(e)) return;
      const s = useGame.getState();
      if (s.title || s.dialog || usePuzzle.getState().escaped) return;
      if (e.key === "h") useGame.setState({ hideUI: !s.hideUI });
      if (e.key === "p") takePhoto();
      if (e.key === "?" || e.key === "F1") { e.preventDefault(); useGame.setState({ dialog: "controls" }); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
}

function TurnSideways() {
  return (
    <div className="fixed inset-0 z-50 hidden flex-col items-center justify-center gap-3 bg-background p-6 text-center [@media(orientation:portrait)_and_(pointer:coarse)]:flex">
      <p className="text-3xl font-light uppercase tracking-[0.2em] text-wood">Turn your phone sideways</p>
      <p className="text-muted-foreground">The gallery is best in landscape.</p>
    </div>
  );
}

export function Hud() {
  useHudKeys();
  const title = useGame((s) => s.title), hideUI = useGame((s) => s.hideUI), escaped = usePuzzle((s) => s.escaped);
  if (title) return <><Title /><TurnSideways /></>;
  if (escaped) return <><Escaped /><TurnSideways /></>;
  return (
    <>
      <TurnSideways />
      <Dialogs />
      {!hideUI && <LeftPanel />}
    </>
  );
}
