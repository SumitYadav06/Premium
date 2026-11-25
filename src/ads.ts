// ============================================================================
// AdMob — Apna Jugaad (Premium Store)
// ----------------------------------------------------------------------------
// Real AdMob video ads ONLY (Interstitial, Rewarded, App Open). NO banner —
// the store UI must stay exactly as it is, no ad slot anywhere on screen.
//
// How it works:
// - The APK is a Capacitor shell that loads the live site, so the AdMob
//   plugin lives in the APK build only. On the website (GitHub Pages) this
//   module is a silent no-op: every call resolves false and nothing renders.
// - init() is called once from main.tsx. It never blocks the app and never
//   throws: any failure just means "no ads this session".
// - Placements (see App.tsx / RequestAppModal.tsx):
//   * App Open  — once per cold start, after init.
//   * Interstitial — only after every 3rd completed download, never while
//     browsing, never before a download starts.
//   * Rewarded — ONLY when the user himself taps "Boost" in the Request App
//     modal; the boost is applied only when AdMob reports the reward earned.
// - AdMob unit IDs are public identifiers only (they cannot move money or
//   open the AdMob account); payment stays tied to the AdMob account.
// ============================================================================

import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
  AppOpenAdPluginEvents,
} from '@capacitor-community/admob';

export const ADMOB_CONFIG = {
  // Apna Jugaad — AdMob app (created 2026-11-25). One AdMob app per app:
  // game IDs must never be reused here.
  appId: 'ca-app-pub-2948876721824340~6169328571',
  interstitialId: 'ca-app-pub-2948876721824340/2353693290',
  rewardedId: 'ca-app-pub-2948876721824340/8751580689',
  appOpenId: 'ca-app-pub-2948876721824340/6991455654',
} as const;

let initialized = false;
let initPromise: Promise<boolean> | null = null;
let interstitialReady = false;
let rewardedReady = false;
let appOpenReady = false;

function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Preload all three video formats. Failures are swallowed — ads are optional. */
async function preloadAll(): Promise<void> {
  try {
    await AdMob.prepareInterstitial({ adId: ADMOB_CONFIG.interstitialId });
  } catch {
    /* no fill / offline — retry on next show attempt */
  }
  try {
    await AdMob.prepareRewardVideoAd({ adId: ADMOB_CONFIG.rewardedId });
  } catch {
    /* no fill / offline */
  }
  try {
    await AdMob.loadAppOpen({ adId: ADMOB_CONFIG.appOpenId });
  } catch {
    /* no fill / offline */
  }
}

/**
 * Initialise the AdMob SDK + UMP consent (best effort, never blocks).
 * Safe to call on the website too — it resolves false there.
 */
export function initAds(): Promise<boolean> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!isNative()) return false;
    try {
      await AdMob.initialize();
      // UMP consent: ask only if the SDK says consent is required.
      try {
        const info = await AdMob.requestConsentInfo();
        const status = String((info as any)?.status ?? '');
        if (status === 'Required' || status === '2') {
          await AdMob.showConsentForm();
        }
      } catch {
        /* consent not required / unavailable — continue without it */
      }
      // Track load state so show*() never waits on a dead ad.
      await AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
        interstitialReady = true;
      });
      await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, () => {
        interstitialReady = false;
      });
      await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        interstitialReady = false;
        void AdMob.prepareInterstitial({ adId: ADMOB_CONFIG.interstitialId }).catch(() => {});
      });
      await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
        interstitialReady = false;
      });
      await AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        rewardedReady = true;
      });
      await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        rewardedReady = false;
      });
      await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        rewardedReady = false;
        void AdMob.prepareRewardVideoAd({ adId: ADMOB_CONFIG.rewardedId }).catch(() => {});
      });
      await AdMob.addListener(AppOpenAdPluginEvents.Loaded, () => {
        appOpenReady = true;
      });
      await AdMob.addListener(AppOpenAdPluginEvents.FailedToLoad, () => {
        appOpenReady = false;
      });
      await AdMob.addListener(AppOpenAdPluginEvents.Closed, () => {
        appOpenReady = false;
      });
      await preloadAll();
      initialized = true;
      return true;
    } catch {
      return false;
    }
  })();
  return initPromise;
}

/**
 * Show an interstitial video ad. Resolves true when the ad was shown and
 * dismissed, false when no ad was available. Never throws, never blocks
 * the caller for long (120s safety cap — the user is never stuck on an ad).
 */
export async function showInterstitialAd(): Promise<boolean> {
  try {
    if (!initialized) {
      const ok = await initAds();
      if (!ok) return false;
    }
    if (!interstitialReady) {
      try {
        await AdMob.prepareInterstitial({ adId: ADMOB_CONFIG.interstitialId });
      } catch {
        return false;
      }
    }
    // Wait for the Dismissed event; time out so the UI can never hang
    // (120s safety cap — a video ad can run ~30s, the user is never stuck).
    // Listeners are removed after resolving so repeated calls don't leak.
    const dismissed = new Promise<boolean>((resolve) => {
      let done = false;
      const finish = (v: boolean) => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        void h1?.remove().catch(() => {});
        void h2?.remove().catch(() => {});
        resolve(v);
      };
      const timer = window.setTimeout(() => finish(false), 120000);
      let h1: { remove: () => Promise<void> } | undefined;
      let h2: { remove: () => Promise<void> } | undefined;
      void AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => finish(true)).then((h) => {
        h1 = h;
      }).catch(() => {});
      void AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => finish(false)).then((h) => {
        h2 = h;
      }).catch(() => {});
    });
    try {
      await AdMob.showInterstitial();
    } catch {
      return false;
    }
    return await dismissed;
  } catch {
    return false;
  }
}

/**
 * Show a rewarded video ad. Resolves true ONLY when AdMob reports the
 * reward earned. Closing early / no fill / any error resolves false —
 * the caller must grant nothing in that case.
 */
export async function showRewardedAd(): Promise<boolean> {
  try {
    if (!initialized) {
      const ok = await initAds();
      if (!ok) return false;
    }
    if (!rewardedReady) {
      try {
        await AdMob.prepareRewardVideoAd({ adId: ADMOB_CONFIG.rewardedId });
      } catch {
        return false;
      }
    }
    try {
      // v8: resolves with the reward item when the user earns it.
      await AdMob.showRewardVideoAd();
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Show the App Open video ad once per cold start. Call after init; the
 * sessionStorage guard makes sure it never shows twice in one session.
 * Resolves true if an ad was shown.
 */
export async function showAppOpenOnce(): Promise<boolean> {
  try {
    if (!initialized) {
      const ok = await initAds();
      if (!ok) return false;
    }
    try {
      if (sessionStorage.getItem('aj_appopen_shown') === '1') return false;
    } catch {
      /* storage unavailable — still show at most once per init */
    }
    if (!appOpenReady) {
      try {
        await AdMob.loadAppOpen({ adId: ADMOB_CONFIG.appOpenId });
      } catch {
        return false;
      }
    }
    try {
      const { value } = await AdMob.isAppOpenLoaded();
      if (!value) return false;
      await AdMob.showAppOpen();
      try {
        sessionStorage.setItem('aj_appopen_shown', '1');
      } catch {
        /* ignore */
      }
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/** Same bridge shape as the games, for the parent's tooling. */
declare global {
  interface Window {
    AdMobNative?: {
      init: () => Promise<boolean>;
      showInterstitial: () => Promise<boolean>;
      showRewarded: () => Promise<boolean>;
      showAppOpenOnce: () => Promise<boolean>;
    };
  }
}

if (typeof window !== 'undefined') {
  window.AdMobNative = {
    init: initAds,
    showInterstitial: showInterstitialAd,
    showRewarded: showRewardedAd,
    showAppOpenOnce,
  };
}
