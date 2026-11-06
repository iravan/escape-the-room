"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { stick, useGame } from "@/lib/store";

const R = 36; // stick travel, px

// Walking on a touch screen: drag the knob like WASD (up = forward), bottom left. Only for touch (coarse) pointers.
function MoveStick() {
  const [at, setAt] = useState<[number, number]>([0, 0]), [sprint, setSprint] = useState(false), origin = useRef<[number, number] | null>(null);
  const move = (x: number, y: number) => {
    if (!origin.current) return;
    let dx = x - origin.current[0], dy = y - origin.current[1];
    const d = Math.hypot(dx, dy), outside = d > R;
    stick.run = outside; // finger outside the circle: run
    setSprint(outside);
    if (outside) { dx *= R / d; dy *= R / d; }
    setAt([dx, dy]);
    stick.x = dx / R;
    stick.y = -dy / R;
  };
  const stop = () => { origin.current = null; setAt([0, 0]); setSprint(false); stick.x = stick.y = 0; stick.run = false; };
  return (
    <div
      aria-label="Move"
      className={`fixed bottom-4 left-4 hidden size-24 touch-none select-none items-center justify-center rounded-full border bg-background/50 shadow-md backdrop-blur [@media(pointer:coarse)]:flex ${sprint ? "border-wood ring-2 ring-wood/40" : "border-border"}`}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); const r = e.currentTarget.getBoundingClientRect(); origin.current = [r.left + r.width / 2, r.top + r.height / 2]; move(e.clientX, e.clientY); }}
      onPointerMove={(e) => move(e.clientX, e.clientY)}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      <div className={`size-10 rounded-full shadow ${sprint ? "bg-wood" : "bg-foreground/75"}`} style={{ transform: `translate(${at[0]}px, ${at[1]}px)` }} />
    </div>
  );
}

// Touch: the move stick, and a way out of showcase mode.
export function TouchControls() {
  const hideUI = useGame((s) => s.hideUI), title = useGame((s) => s.title);
  if (title) return null;
  if (hideUI) return (
    <Button size="sm" variant="outline" className="fixed bottom-3 right-3 bg-background/80 opacity-80" onClick={() => useGame.setState({ hideUI: false })}>Show controls</Button>
  );
  return <MoveStick />;
}
