# Artworks

Every artwork in the gallery lives in this folder: the image files plus `artworks.json`, which describes them.

To add one:

1. Drop the image here (`.jpg`, `.png`, `.webp` or `.svg`).
2. Add an entry to `artworks.json`:

```json
{
  "id": "my-painting",
  "image": "my-painting.jpg",
  "title": "My Painting",
  "artist": "Me",
  "year": "2026",
  "medium": "Oil on canvas",
  "description": "Shown when someone clicks the artwork. Use \n\n for paragraphs.",
  "spot": "n2"
}
```

| Field | Meaning | Default |
| --- | --- | --- |
| `image` | File name in this folder (required) | — |
| `id` | Unique name | the file name |
| `title`, `artist`, `year`, `medium`, `description` | Shown in the panel when the artwork is clicked | empty (title = file name) |
| `spot` | Where it hangs (table below) | the next free spot, in table order |
| `width` | Frame width in metres (0.2–2); the height follows the image | the spot's original frame width |
| `height` | Height of the frame's centre above the floor, metres | the spot's original height |

Each spot gets a spotlight once something hangs there. One artwork per spot; with more artworks than spots the extras
are left out.

| Spot | Where |
| --- | --- |
| `w1` | West room, far wall |
| `w2` | West room, by the window |
| `w3` | West room, right of the corridor |
| `w4` | West room, left of the corridor |
| `n1` | Corridor, left wall 1 |
| `n2` | Corridor, left wall 2 |
| `n3` | Corridor, left wall 3 |
| `n4` | Corridor, left wall 4 |
| `n5` | Corridor, left wall 5 |
| `s1` | Corridor, right wall 1 |
| `s2` | Corridor, right wall 2 |
| `s3` | Corridor, right wall 3 |
| `s4` | Corridor, right wall 4 |
| `s5` | Corridor, right wall 5 |
| `e1` | East room, right of the corridor |
| `e2` | East room, by the window |
| `e3` | East room, right of the door |
| `e4` | East room, left of the corridor |

"Left" and "right" are as you walk the corridor from the west room (where you start) to the east room (with the blue
door). The config is read at build time: restart `npm run dev` if a change doesn't show, and push to `main` to publish.
