# My Gallery

A 3D room in the browser for showing artworks. Live at https://iravan.github.io/my-gallery/.

**Artworks:** put images in [`web/public/artworks/`](web/public/artworks/) and describe each one in `artworks.json`
(title, artist, year, medium, description, and which wall it hangs on). Click an artwork in the room to read its
description. Field reference: [`web/public/artworks/README.md`](web/public/artworks/README.md).

## Features

- **Artworks** — framed on the walls from a folder + JSON config; click one for its description
- **3D room** — walk around (drag to look, WASD / touch stick), city outside the window
- **Showcase** — photo mode, HUD-free showcase mode
- **Room customisation** — lighting presets, materials, room size, replace item looks with uploaded GLB models
- **Local-first** — room layout and uploaded models persist in the browser

Forked from My Room (a vinyl showcase); the vinyl features were removed.

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
npm test        # Vitest: artworks config, room layout, models
npm run check   # headless Chrome: screenshots, drag artifact scan, FPS
```

More notes (including the `npm` / pnpm alias on some Macs) live in [`web/README.md`](web/README.md).

## Docs

| File | What it is |
| --- | --- |
| [`web/public/artworks/README.md`](web/public/artworks/README.md) | Adding artworks: config fields and placement |
| [`UPLOADS.md`](UPLOADS.md) | How uploaded 3D models are stored |

## License

Texture packs under `web/public/textures/` include their own CC0 / license notes.
