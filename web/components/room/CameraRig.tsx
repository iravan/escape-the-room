"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { stick, typing, useGame } from "@/lib/store";
import { useLayout } from "@/lib/room";

const DEG = Math.PI / 180;
const tmpPos = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpEuler = new THREE.Euler(0, 0, 0, "YXZ");

// Drag to look (mouse or one finger), WASD/arrows to walk.
export function CameraRig() {
  const { camera, gl, events } = useThree();
  const held = useRef(new Set<string>());

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
      if (!last || last.id !== e.pointerId || s.title || useLayout.getState().dragging) return;
      // Unity read mouse axes ×3: ~0.3° per pixel at sensitivity 1. FPS-style: drag right turns right, drag down looks down.
      s.look((e.clientX - last.x) * 0.3 * s.sensitivity, (e.clientY - last.y) * 0.3 * s.sensitivity);
      last = { id: e.pointerId, x: e.clientX, y: e.clientY };
    };
    const up = () => { fingers = Math.max(0, fingers - 1); last = null; };
    const key = (e: KeyboardEvent) => {
      if (e.type === "keyup") { held.current.delete(e.key.toLowerCase()); return; } // a release always counts, wherever focus is
      if (typing(e)) return;
      const s = useGame.getState();
      if (s.dialog || s.title) return; // dialogs own the keyboard; the first key just enters
      if (e.type === "keydown") {
        held.current.add(e.key.toLowerCase());
      }
    };
    const blur = () => held.current.clear();
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
        const y = -s.yaw * DEG, step = 1.5 * Math.min(dt, 0.1);
        // forward is -z in three; rotate (h, -v) by the yaw
        const dx = (h * Math.cos(y) - v * Math.sin(y)) * step;
        const dz = (-h * Math.sin(y) - v * Math.cos(y)) * step;
        const [x, py, z] = s.roomPos;
        const { w, d } = useLayout.getState().size, mx = w / 2 - 0.3, mz = d / 2 - 0.3;
        s.setRoomPos([Math.min(mx, Math.max(-mx, x + dx)), py, Math.min(mz, Math.max(-mz, z + dz))]);
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
