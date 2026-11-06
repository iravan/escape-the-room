"use client";

import { Clickable } from "./Clickable";
import { useGame } from "@/lib/store";

// Hitbox over the gallery's existing notebook (holly_plant_and_book) on the round table by the blue door.
export function Notebook() {
  return (
    <Clickable
      hint="Notebook: how to escape"
      onTap={() => useGame.setState({ dialog: "notebook", menu: false })}
      position={[11.17, 1.05, 0.8]}
    >
      <mesh>
        <boxGeometry args={[0.55, 0.35, 0.4]} />
        {/* Nearly invisible — opacity 0 can skip raycasts; this still hits the existing book/plant on the table. */}
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>
    </Clickable>
  );
}
