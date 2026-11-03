"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { typing, useGame } from "@/lib/store";
import { takePhoto } from "@/lib/photo";
import { Panel } from "./Panel";

const HELP = "Drag to look; WASD or the stick (bottom right) to move. Click an artwork to read about it.";
const one = (v: number | readonly number[]) => (Array.isArray(v) ? v[0] : v) as number;

// Title over the slowly turning gallery; any key, click or tap enters.
function Title() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-black/45 text-center">
      <h1 className="text-6xl font-light uppercase tracking-[0.3em] text-white sm:text-8xl [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]">My Gallery</h1>
      <p className="text-lg text-zinc-100">two rooms and a corridor of artworks</p>
      <Button size="lg" className="mt-6 h-14 px-10 text-xl font-bold">ENTER</Button>
      <p className="text-sm text-zinc-300">tap or press any key · ? for controls</p>
    </div>
  );
}

function LeftPanel() {
  return (
    <Panel side="left">
      <p><b className="text-cyan-300">My Gallery</b><br /><span className="text-zinc-400">{HELP}</span></p>
      <div className="grid gap-1">
        <Button size="sm" variant="outline" onClick={takePhoto}>Photo [P]</Button>
        <Button size="sm" variant="outline" onClick={() => useGame.setState({ hideUI: true })}>Showcase mode [H]</Button>
        <div className="grid grid-cols-2 gap-1">
          <Button size="sm" variant="outline" onClick={() => useGame.setState({ dialog: "settings" })}>Settings</Button>
          <Button size="sm" variant="outline" onClick={() => useGame.setState({ dialog: "controls" })}>Controls [?]</Button>
        </div>
      </div>
    </Panel>
  );
}

const CONTROLS: [string, string][] = [
  ["Everywhere", "P photo · H hide UI (Show controls brings it back) · ? this help"],
  ["Room", "Drag to look, WASD or arrows to move, click anything that lights up."],
  ["Artworks", "Click an artwork to read its description. Esc or Close shuts it."],
  ["Touch screens", "Tap = click, drag = look, the stick at the bottom right = walk. Every panel has a button to close it, no keyboard needed."],
];

function Dialogs() {
  const dialog = useGame((s) => s.dialog), sensitivity = useGame((s) => s.sensitivity), quality = useGame((s) => s.quality);
  const close = () => useGame.setState({ dialog: "" });
  return (
    <>
      <Dialog open={dialog === "controls"} onOpenChange={(o) => { if (!o) close(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Controls</DialogTitle></DialogHeader>
          <dl className="space-y-2 text-sm">
            {CONTROLS.map(([h, t]) => <div key={h}><dt className="font-bold text-cyan-300">{h}</dt><dd className="text-zinc-300">{t}</dd></div>)}
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
            <p className="text-xs text-zinc-400">Low: no glow, no shadows. High: glow, soft shadows, smoothing.</p>
          </div>
          <Button onClick={close}>Close</Button>
        </DialogContent>
      </Dialog>
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
      if (s.dialog) return;
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
    <div className="fixed inset-0 z-50 hidden flex-col items-center justify-center gap-3 bg-[#05020d]/95 p-6 text-center [@media(orientation:portrait)_and_(pointer:coarse)]:flex">
      <p className="text-3xl font-bold text-fuchsia-500 [text-shadow:0_0_18px_#ff40c0]">Turn your phone sideways</p>
      <p className="text-zinc-300">The room is best in landscape.</p>
    </div>
  );
}

export function Hud() {
  useHudKeys();
  const title = useGame((s) => s.title), hideUI = useGame((s) => s.hideUI);
  if (title) return <><Title /><TurnSideways /></>;
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
