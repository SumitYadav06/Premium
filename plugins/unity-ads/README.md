# @premium/unity-ads — local Capacitor plugin for Unity Ads

No maintained npm plugin for Unity Ads exists, so this minimal plugin
is written here and shipped inside the Premium repo. Adapted from the
proven Dripply plugin (`github-staging/dripply/plugins/unity-ads`).

## What it does

Wraps the Unity Ads Android SDK **4.18.0** (`com.unity3d.ads:unity-ads`)
for Capacitor **8**:

| JS method | Native behaviour |
|---|---|
| `initialize({gameId, testMode})` | `UnityAds.initialize(...)`; resolves `{initialized:true}` only on `onInitializationComplete` |
| `loadInterstitial({placementId})` / `showInterstitial(...)` | load-then-show; show resolves when the ad is dismissed (show complete), rejects on show failure |
| `loadRewarded({placementId})` / `showRewarded(...)` | show resolves `{earned:true}` only on `COMPLETED`; `SKIPPED` resolves `{earned:false}` — the store grants nothing then |

VIDEO ADS ONLY: the games' plugin also had `showBanner` /
`hideBanner` — those were **removed** here. Premium shows no banner,
ever. There is also no App Open — Unity Ads has no App Open format,
so the old App Open ad is gone with the switch.

All Unity calls run on the UI thread. The Game ID and placement IDs
are passed in from JS (`src/ads.ts`); this plugin contains no ad
IDs of its own. Web fallback (`src/web.ts`) fails honestly — Unity Ads
cannot run in a browser.

## Capacitor 8 adaptations (vs the games' Capacitor 6 plugin)

- Java bridge API (`Plugin` / `PluginMethod` / `PluginCall` /
  `JSObject` / `@CapacitorPlugin`) is unchanged in Capacitor 8 — no
  Java call-site changes were needed.
- `android/build.gradle`: `compileSdk` / `targetSdkVersion` 34 → **35**
  (the games' Capacitor 6 plugin used 34; Capacitor 8.3.2's host app
  uses 36, and a library targeting below the host is fine).
- `minSdkVersion` stays **26** — but unlike the first assumption,
  Capacitor 8's generated project still resolves to **24**, so the
  workflow MUST raise it to 26 (same manifest-merger fix as the
  games, which raised 22 → 26); verified in the scratch `cap sync`
  test. Without the raise step the build fails at manifest merge.
- Java package renamed `com.dripply.unityads` → `com.premium.unityads`;
  npm name `@dripply/unity-ads` → `@premium/unity-ads`.
- Banner methods + `BannerView` imports removed (video-only rule).

## How it gets into the APK

The app's `package.json` depends on it as `"@premium/unity-ads":
"file:plugins/unity-ads"`. `npm install` copies it into
`node_modules`, and `npx cap sync android` registers it (see
`android/app/src/main/assets/capacitor.plugins.json` and the
`settings.gradle` include). The workflow's "Verify Unity Ads wiring"
step fails the build if the plugin is not registered or if the
Unity Game ID is still the `[FILL IN]` placeholder.

## Files

- `android/build.gradle` — library module, declares the Unity Ads SDK
- `android/src/main/java/com/premium/unityads/UnityAdsPlugin.java` — the bridge
- `src/definitions.ts` / `src/index.ts` / `src/web.ts` — TypeScript API
- `dist/` — hand-written equivalent of the `tsc` output (kept in sync
  by hand; the store uses the native bridge, this is the package entry
  + web fallback)
