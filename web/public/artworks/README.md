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
  "wall": "back",
  "at": 0,
  "height": 1.5,
  "width": 0.6
}
```

| Field | Meaning | Default |
| --- | --- | --- |
| `image` | File name in this folder (required) | — |
| `id` | Unique name | the file name |
| `title`, `artist`, `year`, `medium`, `description` | Shown in the panel when the artwork is clicked | empty (title = file name) |
| `wall` | `back` (window wall), `front` (door wall), `left` or `right` | `back` |
| `at` | Metres from the wall's centre; + is to your right as you face the wall | `0` |
| `height` | Height of the artwork's centre above the floor, metres | `1.5` |
| `width` | Width in metres; height follows the image's proportions | `0.6` |

The room is 4 × 4 m by default, so `at` runs from about −1.8 to 1.8. The config is read at build time: restart
`npm run dev` if a change doesn't show, and push to `main` to publish.
