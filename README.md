# Apna Jugaad — Premium Store

Clean, fast React + Vite + Tailwind (v4) Android app store. Deploys to GitHub Pages at
`https://sumityadav06.github.io/Premium/` and the Android APK is built from this repo
via `.github/workflows/build-apk.yml` (do not edit that workflow).

## Data

- **Firebase Realtime Database** (`premium-store-24880`): `apps_list`, `stats`,
  `stats/<slug>/comments`, `requests`, `broken_reports`, `store_status`.
  Config lives in `src/services/firebase.ts` (same project as before).
- **GitHub Releases**: `src/services/githubApps.ts` turns APK assets in this repo's
  releases into store listings. Firebase entries win on the same download link.

## Features

- Fast load: one font family (Plus Jakarta Sans), lazy images, no infinite
  animations, no auto-reload, static top icon.
- Search in a `<form onSubmit>` — submitting blurs the input so the mobile
  keyboard closes.
- Top 10 rail: solid gradient rank numbers (1 gold, 2 dark slate silver,
  3 bronze, 4–10 deep violet), slow smooth `requestAnimationFrame` auto-scroll
  (~21px/sec, ping-pong, pauses on hover/touch, off with
  `prefers-reduced-motion`).
- Exactly 10 category pills: Video Editing, Photo Editing, Video, Music,
  Social, Games, Tools, Entertainment, Health & Fitness, Education.
- App detail: real screenshots only (`p1..p5` / `screenshots[]`); apps without
  screenshots show the big icon + a note, never the icon as a fake screenshot.
  Download button, request form (→ `requests`), broken-link report (→
  `broken_reports`), reviews (→ `stats/<slug>/comments`).
- Bottom dock: Home, Top 10, Request, Store APK — no Admin Panel / Creator
  button. (Admin edits happen in Firebase directly.)

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint    # tsc --noEmit
npm run build   # vite build (base /Premium/)
```
