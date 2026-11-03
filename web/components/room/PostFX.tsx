"use client";

import { EffectComposer, Bloom, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useGame } from "@/lib/store";

// Camera-like finish: a little bloom on the light sources, ACES roll-off, soft vignette.
// Low quality skips the composer; the renderer's own ACES tone mapping still applies.
export function PostFX() {
  const quality = useGame((s) => s.quality);
  if (quality === 0) return null;
  return (
    <EffectComposer multisampling={quality === 2 ? 4 : 0}>
      <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.1} intensity={0.35} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.35} darkness={0.3} />
    </EffectComposer>
  );
}
