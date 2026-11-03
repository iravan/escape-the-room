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

Forked from My Room (a vinyl showcase); the vinyl features were removed. Older docs (`MIGRATION.md`, `ITEMS.md`, …)
describe the original project.

## Stack

| Area | Tech |
| --- | --- |
| App | Next.js 16, React 19, TypeScript |
| 3D | React Three Fiber, drei, three.js, postprocessing |
| State | Zustand (persisted) |
| UI | Tailwind CSS 4, shadcn/ui |
| Backend | Supabase schema (not wired up yet) |

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

## Repo layout

```
web/          Next.js app (the game)
supabase/     Schema, storage bucket, RLS + policy tests
```

## Docs

| File | What it is |
| --- | --- |
| [`game_design_document_visual_vinyl_showcase.md`](game_design_document_visual_vinyl_showcase.md) | Original design doc |
| [`MIGRATION.md`](MIGRATION.md) | Unity → web rebuild checklist |
| [`REALISM.md`](REALISM.md) | Per-item realism pass |
| [`CUSTOMIZATION.md`](CUSTOMIZATION.md) | Room options and model upload plan |

The original Unity build is kept at git tag `unity-final` (`git checkout unity-final`).

## License

Private repository. Texture packs under `web/public/textures/` include their own CC0 / license notes.
