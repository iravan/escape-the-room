# My Gallery

A 3D gallery in the browser for showing artworks: two round, skylit rooms joined by a corridor. Live at https://iravan.github.io/my-gallery/.

**Artworks:** put images in [`web/public/artworks/`](web/public/artworks/) and describe each one in `artworks.json`
(title, artist, year, medium, description, and which of the 18 hanging spots it takes). Click an artwork in the room to read its
description. Field reference: [`web/public/artworks/README.md`](web/public/artworks/README.md).

## Features

- **Artworks** — framed and spotlit in the gallery's hanging spots from a folder + JSON config; click one for its description
- **Gallery** — modelled on "Richard's Art Gallery – Audio Tour" and rebuilt entirely in code (`web/components/room/Gallery.tsx`,
  plan in `web/lib/gallery.ts`): stepped round skylights, dark wood floor, curved benches, pedestal tables, plants,
  windows with sheer curtains, the blue door
- **Walk around** — drag to look, WASD / touch stick to move; walls and tables block you
- **Showcase** — photo mode, HUD-free showcase mode

Forked from My Room (a vinyl bedroom); the bedroom, vinyl features and room editor were removed.

## Stack

| Area | Tech |
| --- | --- |
| App | Next.js 16, React 19, TypeScript |
| 3D | React Three Fiber, drei, three.js, postprocessing |
| State | Zustand (persisted) |
| UI | Tailwind CSS 4, shadcn/ui |

## Quick start

```sh
cd web
npm install
npm run dev     # http://localhost:3000
```

Requires **Node ≥ 20.9**. Useful scripts:

```sh
npm run build
npm test        # Vitest: artworks config, floor plan
npm run check   # headless Chrome: screenshots, drag artifact scan, FPS
```

More notes (including the `npm` / pnpm alias on some Macs) live in [`web/README.md`](web/README.md).

## Docs

| File | What it is |
| --- | --- |
| [`web/public/artworks/README.md`](web/public/artworks/README.md) | Adding artworks: config fields and placement |

## License

The floor texture under `web/public/textures/` is CC0 (Poly Haven); see its LICENSE.txt.
