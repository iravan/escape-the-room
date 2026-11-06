"use client";

import { useEffect } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { typing, useGame } from "@/lib/store";
import { takePhoto } from "@/lib/photo";
import { EXHIBITION } from "@/lib/artworks";
import { usePuzzle } from "@/lib/puzzle";
import { Panel } from "./Panel";
import { Escaped, PuzzleDialog } from "./Puzzle";

const HELP = "Drag to look; WASD or the stick (bottom left) to move. Read the clue under each painting, then solve the hiragana chart at the far end of the west room.";
const one = (v: number | readonly number[]) => (Array.isArray(v) ? v[0] : v) as number;

// Title over the slowly turning gallery; any key, click or tap enters.
function Title() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background/60 text-center backdrop-blur-[2px]">
      <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">A Japanese puzzle game</p>
      <h1 className="text-5xl font-light uppercase tracking-[0.2em] text-foreground sm:text-7xl">{EXHIBITION.title}</h1>
      <div className="h-1 w-40 bg-foreground" />
      {EXHIBITION.subtitle && <p className="text-lg text-wood">{EXHIBITION.subtitle}</p>}
      <Button size="lg" className="mt-6 h-14 px-10 text-xl font-bold">ENTER</Button>
      <p className="text-sm text-muted-foreground">tap or press any key · ? for controls</p>
    </div>
  );
}

// On touch screens the menu folds away behind a ☰ button (top right) so the gallery fills the screen; it opens under the button.
function LeftPanel() {
  const open = useGame((s) => s.menu), holes = usePuzzle((s) => s.holes), placed = usePuzzle((s) => s.holes.filter((i) => s.placed[i]).length);
  const toggle = () => useGame.setState({ menu: !open });
  return (
    <>
    <Button size="icon" variant="outline" aria-label={open ? "Hide menu" : "Show menu"} aria-expanded={open} onClick={toggle}
      className="fixed right-2.5 top-2.5 hidden bg-background/90 shadow-md [@media(pointer:coarse)]:inline-flex">
      {open ? <XIcon /> : <MenuIcon />}
    </Button>
    <Panel side="left" className={`[@media(pointer:coarse)]:left-auto [@media(pointer:coarse)]:right-2.5 [@media(pointer:coarse)]:top-14 [@media(pointer:coarse)]:max-h-[calc(100dvh-4.5rem)] ${open ? "" : "[@media(pointer:coarse)]:hidden"}`}>
      <p><b className="text-wood">{EXHIBITION.title}</b>{EXHIBITION.subtitle && <><br /><span className="text-xs">{EXHIBITION.subtitle}</span></>}<br /><span className="text-muted-foreground">{HELP}</span></p>
      <p className="font-semibold">Chart: {placed} / {holes.length} kana placed</p>
      <p className="text-[11px] leading-snug text-muted-foreground">
        Gallery: <a className="underline" href="https://sketchfab.com/3d-models/richards-art-gallery-audio-tour-0e3e19faa6474fd5974e6a7ed1b221d8" target="_blank" rel="noreferrer">Richard&apos;s Art Gallery – Audio Tour</a> by{" "}
        <a className="underline" href="https://sketchfab.com/shinymagic" target="_blank" rel="noreferrer">shinymagic</a>,{" "}
        <a className="underline" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> (optimised)
      </p>
      <div className="grid gap-1">
        {EXHIBITION.intro && <Button size="sm" onClick={() => useGame.setState({ dialog: "about" })}>How to escape</Button>}
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

const CONTROLS: [string, string][] = [
  ["Everywhere", "P photo · H hide UI (Show controls brings it back) · ? this help"],
  ["Room", "Drag to look, WASD or arrows to move (double-tap a move key to run), click anything that lights up."],
  ["Paintings", "Each painting has a plaque under it with a Japanese word and one kana. Walk up and read it — paintings are not clickable."],
  ["Hiragana chart", "On the table at the far end of the west room. Click it, pick a piece, tap the hole it belongs in. Tap a placed piece to take it back."],
  ["Touch screens", "Tap = click, drag = look, the stick at the bottom left = walk (drag past the circle to run), ☰ (top right) shows or hides the menu. Every panel has a button to close it, no keyboard needed."],
];

function Dialogs() {
  const dialog = useGame((s) => s.dialog), sensitivity = useGame((s) => s.sensitivity), quality = useGame((s) => s.quality);
  const close = () => useGame.setState({ dialog: "" });
  return (
    <>
      <Dialog open={dialog === "about"} onOpenChange={(o) => { if (!o) close(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">How to escape</p>
            <DialogTitle className="text-2xl font-light uppercase tracking-[0.15em]">{EXHIBITION.title}</DialogTitle>
            {EXHIBITION.subtitle && <p className="text-wood">{EXHIBITION.subtitle}</p>}
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{EXHIBITION.intro}</p>
          <Button onClick={close}>Enter the gallery</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={dialog === "controls"} onOpenChange={(o) => { if (!o) close(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Controls</DialogTitle></DialogHeader>
          <dl className="space-y-2 text-sm">
            {CONTROLS.map(([h, t]) => <div key={h}><dt className="font-bold text-wood">{h}</dt><dd className="text-muted-foreground">{t}</dd></div>)}
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

// Keys that work everywhere outside dialogs: title dismiss, L, H, P, ?.
function useHudKeys() {
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (typing(e)) return;
      const s = useGame.getState();
      if (s.title) { enter(); return; }
      if (s.dialog || usePuzzle.getState().escaped) return;
      if (e.key === "h") useGame.setState({ hideUI: !s.hideUI });
      if (e.key === "p") takePhoto();
      if (e.key === "?" || e.key === "F1") { e.preventDefault(); useGame.setState({ dialog: "controls" }); }
    };
    // Leave the title after this event has been handled everywhere, so the key or click that enters
    // doesn't also switch a view or toggle the lamp.
    const enter = () => setTimeout(() => useGame.setState({ title: false }), 0);
    const tap = () => { if (useGame.getState().title) enter(); };
    window.addEventListener("keydown", key);
    window.addEventListener("pointerup", tap);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener("pointerup", tap); };
  }, []);
}

// Portrait phones are too narrow for the side panels: ask for landscape instead of shrinking everything.
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
      {!hideUI && (
        <>
          <LeftPanel />
        </>
      )}
    </>
  );
}
