# Escape the Room (web)

Next.js 16 + React Three Fiber + Zustand + Tailwind + shadcn/ui. Paintings and their clues: `public/artworks/` (see its README);
the hiragana chart puzzle: `lib/puzzle.ts`.

```sh
bun install
bun run dev     # http://localhost:3000
bun run build
bun run test    # Vitest: artworks config, floor plan, hiragana puzzle
bun run check   # needs a running server (default http://127.0.0.1:3100/): room screenshot, drag artifact scan, FPS
```

Bun 1.4. `bun.lock` is the lockfile. CI runs `bun install --frozen-lockfile`.
three is pinned to 0.186 until `postprocessing` supports 0.187.
