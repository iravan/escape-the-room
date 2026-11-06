"use client";

import * as THREE from "three";
import { Clickable } from "./Clickable";
import { useGame } from "@/lib/store";

const YAW = new THREE.Euler(0, 0.4, 0);

// The notebook on the west-room round table. Click it for the escape instructions — you need to solve the puzzle.
export function Notebook() {
  return (
    <Clickable
      hint="Notebook: how to escape"
      onTap={() => useGame.setState({ dialog: "notebook", menu: false })}
      position={[-8.75, 0.9, 0.12]}
      rotation={YAW}
    >
      {/* Closed book: walnut cover, cream page edge */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.28, 0.03, 0.2]} />
        <meshStandardMaterial color="#5a3428" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.031, 0]}>
        <boxGeometry args={[0.26, 0.004, 0.185]} />
        <meshStandardMaterial color="#f6efdf" roughness={0.9} />
      </mesh>
    </Clickable>
  );
}
