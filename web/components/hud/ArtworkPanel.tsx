"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Panel } from "./Panel";
import { ARTWORKS, artworkUrl, useArtwork } from "@/lib/artworks";

const close = () => useArtwork.setState({ open: "" });

// Description of the clicked artwork: image, title, artist, year, medium and the text from artworks.json.
export function ArtworkPanel() {
  const open = useArtwork((s) => s.open), a = ARTWORKS.find((x) => x.id === open);
  useEffect(() => {
    if (!a) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [a]);
  if (!a) return null;
  return (
    <Panel side="right">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimisation */}
      <img src={artworkUrl(a)} alt={a.title} className="max-h-56 w-full rounded object-contain" />
      <div>
        <h2 className="text-lg font-bold text-fuchsia-400">{a.title}</h2>
        {a.artist && <p>{a.artist}</p>}
        {(a.year || a.medium) && <p className="italic text-zinc-400">{[a.year, a.medium].filter(Boolean).join(" · ")}</p>}
      </div>
      {a.description && <p className="whitespace-pre-wrap">{a.description}</p>}
      <Button size="sm" variant="secondary" onClick={close}>Close [Esc]</Button>
    </Panel>
  );
}
