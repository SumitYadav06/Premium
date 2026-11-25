<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2b245b45-8550-4d47-8dcf-d1b1bbe07750

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

<!-- redeploy trigger -->

---

## Advertising (AdMob) — APK only

The Android APK shows **video ads only** (no banner, no ad slot on any
screen) via Google AdMob (`@capacitor-community/admob` v8, real SDK —
see `src/ads.ts`):

- **App Open** — once per cold start (`src/main.tsx`).
- **Interstitial** — only after every 3rd completed download
  (`src/App.tsx` → `DirectInstallerModal` `onDownloadCompleted`).
- **Rewarded** — only when the user taps "Boost" in the Request App modal;
  the boost applies only when AdMob reports the reward earned.

AdMob IDs live in `src/ads.ts` (`ADMOB_CONFIG`) and the App ID is written
into `AndroidManifest.xml` by the "Configure AdMob App ID" step in
`.github/workflows/build-apk.yml`. The website (GitHub Pages) shows no ads.

Privacy policy: `privacy-policy.md` (fill in the contact email before
publishing).

> ⚠️ Honest note: this store distributes modified ("mod") APKs. AdMob
> review can limit or reject ads for apps that distribute modded/cracked
> apps, and an AdMob account can be suspended for policy violations.
> Correct wiring does **not** guarantee ads will serve or earn — approval
> is Google's decision, and the store's content is the risk, not the code.

---

## Speed & new features (2026-11-25)

- **Faster open:** Firebase (~338 kB) now loads lazily after first paint
  instead of in the first bundle (first-load JS ~830 kB → ~484 kB raw,
  ~223 kB → ~152 kB gzip); splash shortened 1.6 s → 1.0 s; stats updates
  throttled to 800 ms so the grid doesn't re-render on every view/download;
  off-screen cards render on demand (`content-visibility: auto`).
- **Launcher icon:** the user's logo at 85% (368×368 inside the 432×432
  foreground) on its own edge colour #0E347F — full-size was too zoomed,
  72% looked small; legacy icons use the Lanczos filter for the sharpest
  downscale.
- **UPDATE badge:** an app you already downloaded shows an amber UPDATE
  badge (card + detail page) when the store has a newer version.
- **Live download progress:** the Downloads drawer now shows real %/speed
  while a download runs (native in-app download or web), even if you close
  the installer modal; tasks are created only when a download really starts
  (previously a fake 100% "ready" task appeared on tap).
- **Offline banner:** a slim amber strip appears when the network drops.

---

## Final pass (2026-11-25 evening)

- **Favourites filter:** a "Saved (n)" chip next to Sort shows only
  bookmarked apps on the home list (bookmark toggle on cards + detail
  and the Saved drawer already existed; the in-list filter is new).
- **Sort — Newest First:** new option in the Sort dropdown. Firebase
  returns apps oldest-first, so the list is reversed (no per-app date
  field exists in the data). Most Downloaded and A–Z already existed.
- **Share on cards:** each app card now has a share button (top-right,
  next to bookmark) — native share sheet, clipboard copy as fallback
  with a small toast. Detail page share is unchanged.
- **Force update for the old 5 MB APK:** the old APK is the same
  live-sync WebView shell, so on boot the site checks the Capacitor
  bridge (up to 5 s): native shell + AdMob native plugin missing =
  old APK → a full-screen, no-bypass "Update Karo" blocker with a
  download button for the new APK. New APK, browsers and uncertain
  bridge states are never blocked (fail open). Detection uses
  `Capacitor.isPluginAvailable('AdMob')` (native PluginHeaders) —
  `window.Capacitor.Plugins.AdMob` is NOT a valid check because
  `registerPlugin` creates that proxy everywhere. See
  `src/utils/forceUpdate.ts` and `src/components/ForceUpdateBlocker.tsx`.
