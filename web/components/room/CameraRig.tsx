"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { stick, typing, useGame } from "@/lib/store";
import { DEG, START, walkable } from "@/lib/gallery";
import { usePuzzle } from "@/lib/puzzle";

const tmpPos = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpEuler = new THREE.Euler(0, 0, 0, "YXZ");

const MOVE = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]);
const WALK = 1.5, RUN = 2.8, DOUBLE_MS = 300; // m/s; double-tap a move key within this window to run

// Drag to look (mouse or one finger), WASD/arrows to walk; double-tap a move key (or drag the stick past its circle) to run.
export function CameraRig() {
  const { camera, gl, events } = useThree();
  const held = useRef(new Set<string>());
  const run = useRef(false), lastTap = useRef(0), lastKey = useRef("");

  // A saved position can be somewhere you can no longer stand (furniture added, an older layout): start at the entrance.
  useEffect(() => {
    const unsub = useGame.persist.onFinishHydration((s) => { if (!walkable(s.roomPos[0], s.roomPos[2])) useGame.setState({ roomPos: START.position, yaw: START.yaw }); });
    const s = useGame.getState();
    if (useGame.persist.hasHydrated() && !walkable(s.roomPos[0], s.roomPos[2])) useGame.setState({ roomPos: START.position, yaw: START.yaw });
    return unsub;
  }, []);

  useEffect(() => {
    const el = gl.domElement;
    // Look follows one pointer (mouse or a single finger); a second finger stops looking, like Unity's touchCount == 1.
    let last: { id: number; x: number; y: number } | null = null, fingers = 0;
    const down = (e: PointerEvent) => {
      fingers++;
      last = fingers === 1 ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      const s = useGame.getState();
      if (!last || last.id !== e.pointerId || s.title) return;
      // Unity read mouse axes ×3: ~0.3° per pixel at sensitivity 1. FPS-style: drag right turns right, drag down looks down.
      s.look((e.clientX - last.x) * 0.3 * s.sensitivity, (e.clientY - last.y) * 0.3 * s.sensitivity);
      last = { id: e.pointerId, x: e.clientX, y: e.clientY };
    };
    const up = () => { fingers = Math.max(0, fingers - 1); last = null; };
    const key = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.type === "keyup") {
        held.current.delete(k);
        if (MOVE.has(k)) { lastTap.current = performance.now(); lastKey.current = k; }
        if (![...held.current].some((x) => MOVE.has(x))) run.current = false;
        return;
      }
      if (e.repeat || typing(e)) return;
      const s = useGame.getState();
      if (s.dialog || s.title || usePuzzle.getState().escaped) return; // dialogs own the keyboard; the first key just enters
      if (MOVE.has(k) && k === lastKey.current && performance.now() - lastTap.current < DOUBLE_MS) run.current = true;
      held.current.add(k);
    };
    const blur = () => { held.current.clear(); run.current = false; };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    window.addEventListener("keydown", key);
    window.addEventListener("keyup", key);
    window.addEventListener("blur", blur);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      window.removeEventListener("keydown", key);
      window.removeEventListener("keyup", key);
      window.removeEventListener("blur", blur);
    };
  }, [gl]);

  useFrame((_, dt) => {
    const s = useGame.getState();
    if (s.title) useGame.setState({ yaw: s.yaw + Math.min(dt, 0.1) * 4 }); // the room turns slowly behind the title
    {
      const k = held.current;
      const clamp = (n: number) => Math.max(-1, Math.min(1, n));
      const h = clamp((k.has("d") || k.has("arrowright") ? 1 : 0) - (k.has("a") || k.has("arrowleft") ? 1 : 0) + stick.x);
      const v = clamp((k.has("w") || k.has("arrowup") ? 1 : 0) - (k.has("s") || k.has("arrowdown") ? 1 : 0) + stick.y);
      if (h || v) {
        const y = -s.yaw * DEG, step = (run.current || stick.run ? RUN : WALK) * Math.min(dt, 0.1);
        // forward is -z in three; rotate (h, -v) by the yaw
        const dx = (h * Math.cos(y) - v * Math.sin(y)) * step;
        const dz = (-h * Math.sin(y) - v * Math.cos(y)) * step;
        // Walk the floor plan, sliding along walls: try the full step, then each axis on its own.
        const [x, py, z] = s.roomPos;
        // (Already somewhere blocked? Then any step goes, so you can always walk out.)
        const to = walkable(x, z) ? [[x + dx, z + dz], [x + dx, z], [x, z + dz]].find(([nx, nz]) => walkable(nx, nz)) : [x + dx, z + dz];
        if (to) s.setRoomPos([to[0], py, to[1]]);
      }
      tmpPos.set(...s.roomPos);
      tmpQuat.setFromEuler(tmpEuler.set(-s.pitch * DEG, -s.yaw * DEG, 0));
    }
    const t = 1 - Math.exp(-6 * Math.min(dt, 0.1));
    const moving = camera.position.distanceToSquared(tmpPos) > 1e-8 || 1 - Math.abs(camera.quaternion.dot(tmpQuat)) > 1e-8;
    camera.position.lerp(tmpPos, t);
    camera.quaternion.slerp(tmpQuat, t);
    // Re-test what's under the pointer while the camera moves (R3F only does it on pointer events),
    // so hover highlights and tooltips follow the view like Unity's per-frame raycast.
    if (moving) events.update?.();
  });

  return null;
}
