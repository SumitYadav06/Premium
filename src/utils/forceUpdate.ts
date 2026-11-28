// Force-update detection — ONLY the newest APK may run.
//
// Two signals, either one alone blocks an old APK:
//   1. `Capacitor.isPluginAvailable('UnityAds')` — true ONLY when the
//      native Unity Ads plugin class is actually inside the installed
//      APK. Old pre-Unity APKs lack it, so they are blocked.
//      (Why not `window.Capacitor.Plugins.UnityAds`: registerPlugin
//      creates that proxy in EVERY environment — browser, old APK and
//      new APK alike — so it can never catch an old APK.)
//   2. Version check via `App.getInfo()` (@capacitor/app) — the Android
//      `build` field is the versionCode. Only builds >=
//      MIN_SUPPORTED_BUILD may run. Old Unity-era APKs (#204–#210) do
//      not contain the @capacitor/app native plugin, so getInfo() rejects
//      there and they are blocked too. The newest build (run #211, the
//      first one with the App plugin) is the first that can pass.
//
// Browser (not native) is NEVER blocked — the store website must keep
// working as a catalogue. Fail-open ONLY while the bridge is not ready
// yet (the caller polls and gives up after its deadline); once the
// bridge answers on a native shell, an undetermined version is treated
// as old — a missing plugin on native never slips through as 'new'.
import { App } from '@capacitor/app';
import { STORE_CONFIG } from '../config';

export const FORCE_UPDATE_APK_URL: string = STORE_CONFIG.STORE_APP_APK_URL;

// Minimum Android build number (versionCode) allowed to run. The next
// build-apk run is #211 (last delivered build was #210), and #211 is
// the first build whose APK contains the @capacitor/app native plugin,
// so 211 is the lowest build that can ever pass the getInfo check.
export const MIN_SUPPORTED_BUILD = 211;

export type ApkShellState = 'old-apk' | 'new-or-browser' | 'unknown';

export async function detectApkShellState(): Promise<ApkShellState> {
  try {
    const cap = (window as any).Capacitor;
    if (!cap || typeof cap.isNativePlatform !== 'function') return 'unknown';
    if (!cap.isNativePlatform()) return 'new-or-browser';
    // Signal 1: UnityAds native plugin must be present.
    if (typeof cap.isPluginAvailable === 'function' && !cap.isPluginAvailable('UnityAds')) {
      return 'old-apk';
    }
    // Signal 2: versionCode must be >= MIN_SUPPORTED_BUILD. getInfo()
    // rejects on any APK without the @capacitor/app native plugin
    // (every build before #211), and an unparseable build is not a
    // proof of newness — both mean old.
    let build = NaN;
    try {
      const info = await App.getInfo();
      build = parseInt(String(info?.build ?? ''), 10);
    } catch {
      return 'old-apk';
    }
    if (!Number.isFinite(build) || build < MIN_SUPPORTED_BUILD) return 'old-apk';
    return 'new-or-browser';
  } catch {
    return 'unknown';
  }
}
