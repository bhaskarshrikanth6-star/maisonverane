# Maison Vérane · Hours & Marvels

An immersive, scroll-driven showcase of watchmaking and high jewellery for a **fictional** house, "Maison Vérane".
Twelve cinematic scenes in one WebGL stage. All watches, rings and dials are original geometry drawn in code.

**Stack:** HTML, CSS, vanilla JS · Three.js r128 · GSAP 3.12 · Lenis 1.1 (all from CDN, no build step)

## Features
- 12 scroll-driven scenes (alcove, Calla, close-up, Tavola, atelier, orbit, interlude, Aurum, Tresse, Seuil, Fronde, finale)
- Letter-by-letter title reveals, rolling scene counter, gold progress hairline
- Chapters menu with circular reveal, guided auto-tour, keyboard navigation (↑ ↓ PgUp PgDn Space Home End, M for menu)
- Custom cursor with "View" state, sparkle trail, magnetic buttons, animated film grain
- Click any piece for a product panel with 3D-tilting swatch and a saveable wishlist (stored in localStorage)
- Ambient sound bed (Web Audio, starts only when you press Sound)
- Responsive, reduced-motion aware, keyboard accessible

## Project structure
```
maison-verane/
├── index.html        page markup and script tags
├── css/style.css     all styling and UI animation
├── js/main.js        Three.js scenes, camera, scroll, product panel, audio
├── js/ui.js          cursor, trail, menu, tour, keyboard, wishlist, split text
├── assets/favicon.svg
├── vercel.json       Vercel config (clean URLs, headers)
├── package.json      optional `npm run dev`
└── LICENSE
```

## Run locally
The scripts and fonts load from CDNs, so you need internet access.
```bash
cd maison-verane
python3 -m http.server 8000      # or: npm run dev
# open http://localhost:8000
```
Opening `index.html` directly by double-click also works in most browsers.

## Deploy
See the step-by-step guide in the chat, or: push to GitHub, import the repo in Vercel,
Framework Preset **Other**, leave Build Command and Output Directory empty, Deploy.

## Notes
Maison Vérane is invented. Any resemblance to a real brand's name, logo or product designs is unintended; do not add third-party brand marks.
