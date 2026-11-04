"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Panel } from "./Panel";
import { ARTWORKS, artworkUrl, useArtwork } from "@/lib/artworks";

const close = () => useArtwork.setState({ open: "" });

// The clicked artwork in full, like a gallery guide: image, catalogue number, artist, title, year, medium, size,
// collection, the label text and the longer `details` text from artworks.json.
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
    <Panel side="right" className="[@media(pointer:coarse)]:top-14 [@media(pointer:coarse)]:max-h-[calc(100dvh-4.5rem)]">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimisation */}
      <img src={artworkUrl(a)} alt={a.title} className="max-h-56 w-full rounded border border-border bg-card object-contain p-2" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-wood">No. {a.number}</p>
        <h2 className="text-lg font-semibold italic leading-snug">{a.title}{a.year && <span className="font-normal not-italic">, {a.year}</span>}</h2>
        {a.artist && <p className="font-medium">{a.artist}{a.artistInfo && <span className="font-normal text-muted-foreground"> ({a.artistInfo})</span>}</p>}
      </div>
      {(a.medium || a.dimensions || a.collection) && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 border-y border-border py-2 text-xs">
          {a.medium && <><dt className="text-muted-foreground">Medium</dt><dd>{a.medium}</dd></>}
          {a.dimensions && <><dt className="text-muted-foreground">Size</dt><dd>{a.dimensions}</dd></>}
          {a.collection && <><dt className="text-muted-foreground">Collection</dt><dd>{a.collection}</dd></>}
        </dl>
      )}
      {a.description && <p className="font-medium">{a.description}</p>}
      {a.details && <p className="whitespace-pre-wrap text-muted-foreground">{a.details}</p>}
      <Button size="sm" variant="secondary" onClick={close}>Close [Esc]</Button>
    </Panel>
  );
}
