# Marlon Romero Gomez — The Worlds Within

An immersive exhibition of the artist's paintings, plus a plain, fully accessible archive.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`npm run build` writes a static site to `out/` that any static host can serve.

## Vercel

Pushes to `main` deploy to production. On Vercel the site runs as a regular Next.js app (`vercel.json` pins the
framework): paintings in the page are resized to the visitor's screen and served as AVIF/WebP, while zoom and the
3D worlds always use the original file. Fonts are self-hosted. To reproduce the Vercel build locally:

```bash
npm run preview:vercel
```

## Adding the real content

Everything lives in **`lib/data.ts`**. Put the original, unmodified painting files in `public/art/` and fill in
each entry (`src`, pixel `w`/`h`, and optionally title, year, medium, size, description). Entries without a
file show a neutral "Image pending" tile. Contact details and the story chapters are in the same file.

## Structure

| Path | What it is |
| --- | --- |
| `/` | Opening → gateways → the four worlds (`/?w=origin`, `/?w=vision&a=<id>` deep links) |
| `/collection/` | Complete archive, filterable (`?c=landscapes`), no WebGL required |
| `/collection/<id>/` | Shareable page for each painting, with zoom and inspection |
| `/artist/` | The artist's story in chapters |

| Component | Role |
| --- | --- |
| `components/Stage.tsx` | WebGL: environment, particles, interactive painting, camera, shader transitions (loaded on demand) |
| `components/Experience.tsx` | Opening, gateways, navigation, input, URL state, reduced-motion / no-WebGL fallback |
| `components/Inspector.tsx` | Zoom and detail inspection (wheel, pinch, drag, keyboard) |
| `lib/layout.ts` | Where paintings stand in each world and how the camera frames them |

## Artistic integrity

Paintings are always shown at their own proportions and colours: no tone mapping, lighting or filters are
applied to the artwork. Distance dimming, glows, particles and transition washes are separate layers; a
focused painting is rendered exactly as the file.

Controls: scroll / drag to travel · click or Enter to approach · ← → between paintings · I to inspect · Esc to step back.
