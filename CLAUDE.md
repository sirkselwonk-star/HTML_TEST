# SLIME - 3D NFT Gallery

## Project Structure

Single-file web app — all HTML, CSS, and JavaScript live in `index.html` (~4700 lines).

```
index.html          – Entire application (HTML + inline CSS + inline JS)
SLIME_COIN.png      – Default coin texture asset
neon-gallery.css    – Extracted reusable neon theme (all CSS variables, components, responsive breakpoints)
```

### index.html Sections (by line range)

| Lines       | Section                                                  |
|-------------|----------------------------------------------------------|
| 1-15        | Head: meta tags, external scripts (Three.js r128, gif.js, GLTFExporter, model-viewer) |
| 16-243      | `<style>` — All CSS (also extracted to `neon-gallery.css`)  |
| 244-939     | HTML body — gallery grid, 3D lightbox, control panel, AR overlay, pagination, search bar, theme switcher |
| 940-1039    | `COLOR_THEMES` object — 6 themes (green, cyan, purple, pink, orange, red) with full color/lighting configs |
| 1040-2724   | Three.js scene setup, materials, textures, lighting, control panel wiring, goop/ooze animation, GIF/PNG export |
| 2725-2772   | `loadNFT()` — loads coin face/back textures per gallery item |
| 2774-2854   | Fullscreen helpers, `open3d()`, `close3d()`, `nav()`, `updateInfo()` |
| 2855-4560   | `animate()` loop, lens flare, ooze rendering, GIF/PNG capture pipelines |
| 4561-4675   | `exportPivotToGLB()` — clones scene to GLB for AR export    |
| 4681-4728   | AR functions: `prepareAR()`, `invalidateAR()`, `launchAR()`, `closeAR()` |

## External Dependencies (CDN)

- **Three.js r128** — 3D rendering (`three.min.js`)
- **GLTFExporter** — Three.js r128 example addon for GLB export
- **gif.js 0.2.0** — Client-side GIF encoding
- **Google model-viewer 3.5.0** — AR display (WebXR / Scene Viewer / Quick Look)

## Build / Deploy

No build step. Serve `index.html` from any static host (GitHub Pages, Netlify, S3, etc.).

For local development:
```bash
python3 -m http.server 8000
# or
npx serve .
```

## Key Architecture Notes

- **Single-file design**: Everything is inline to keep deployment simple (one HTML file + one image asset).
- **Theme system**: `COLOR_THEMES` object defines 6 color themes. `applyTheme(name)` updates CSS variables on `:root` and Three.js scene lighting/materials live.
- **3D lightbox**: Three.js renders a framed NFT panel with coin, ring, and glass. User can rotate/zoom. Goop/ooze animation overlays via a separate canvas.
- **AR pipeline**: `exportPivotToGLB()` clones the 3D scene, bakes textures (including rotation-corrected coin face), exports via GLTFExporter to a base64 data URL, then feeds it to `<model-viewer>` for native AR.
- **Gallery**: Cards in a CSS grid with pagination and search. Clicking opens the 3D lightbox. Arrow nav cycles items.
- **Export**: GIF and PNG capture from the 3D viewport with watermark text overlay.
- **Control panel**: Runtime sliders for lighting, materials, zoom, panel position, ring, glass, goop effects, and export settings.

## Coding Conventions

- Vanilla JS (no framework, no modules, no bundler)
- `var` declarations throughout (ES5 style)
- Minified/compact CSS in `<style>` block
- Callback-based async (no Promises)
- Generation counter pattern (`arGen`) for stale async callback handling
