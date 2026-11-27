// Force-update detection — old 5 MB APK vs new APK.
//
// WHY THIS CHECK (not `window.Capacitor.Plugins.UnityAds`):
// `@premium/unity-ads` registers itself with
// `registerPlugin('UnityAds', { web: ... })`, and Capacitor's registerPlugin
// creates the `Capacitor.Plugins.UnityAds` proxy in EVERY environment —
// browser, old APK and new APK alike. So "Plugins.UnityAds is undefined"
// is never true and would never catch the old APK.
//
// The real signal is `Capacitor.isPluginAvailable('UnityAds')`:
//   * On Android it is true ONLY when the native side injected a
//     PluginHeader for UnityAds — i.e. the native Unity Ads plugin class is
//     actually inside the installed APK (the new APK).
//   * On Android without that header (old APK) it is false.
//   * On a normal browser `isNativePlatform()` is false, so we never
//     block there at all.
// (Before 2026-11-27 this checked the previous ad network's plugin;
// that network was fully removed and replaced by Unity Ads, so the
// check moved to the UnityAds plugin.)
//
// Fail-open by design: if the bridge is missing or anything throws,
// we return 'unknown' and the caller must show the store — an old APK
// user slipping through is far better than bricking the new app.
import { STORE_CONFIG } from '../config';

export const FORCE_UPDATE_APK_URL: string = STORE_CONFIG.STORE_APP_APK_URL;

export type ApkShellState = 'old-apk' | 'new-or-browser' | 'unknown';

export function detectApkShellState(): ApkShellState {
  try {
    const cap = (window as any).Capacitor;
    if (!cap || typeof cap.isNativePlatform !== 'function') return 'unknown';
    if (!cap.isNativePlatform()) return 'new-or-browser';
    if (typeof cap.isPluginAvailable === 'function' && cap.isPluginAvailable('UnityAds')) {
      return 'new-or-browser';
    }
    return 'old-apk';
  } catch {
    return 'unknown';
  }
}
