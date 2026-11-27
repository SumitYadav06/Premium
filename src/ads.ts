// ============================================================================
// Unity Ads — Apna Jugaad (Premium Store)
// ----------------------------------------------------------------------------
// Real Unity video ads ONLY (Interstitial, Rewarded). NO banner and NO
// App Open — Premium shows no banner ever, and Unity has no App Open
// format, so the old App Open ad is gone with the switch.
//
// How it works:
// - The APK is a Capacitor shell that loads the live site, so the Unity
//   plugin lives in the APK build only. On the website (GitHub Pages)
//   this module is a silent no-op: every call resolves false and
//   nothing renders.
// - init() is called once from main.tsx. It never blocks the app and
//   never throws: any failure just means "no ads this session".
// - The native bridge is the local plugin plugins/unity-ads
//   (@premium/unity-ads, package com.premium.unityads), adapted from
//   the proven Dripply plugin for Capacitor 8.
// - Placements — MAXIMUM (user, 2026-11-27 21:12 IST): interstitial at
//   EVERY step of the journey, because paid things are free here and
//   users will happily watch ads. No ad on cold start (App Open is gone
//   anyway); ads start from the first user action onward.
//   * Detail page open — interstitial first, detail opens on dismiss
//     (App.tsx openAppDetail).
//   * Download tap — interstitial first, installer modal opens on
//     dismiss (App.tsx handleQuickDownload).
//   * Download start (installer modal button) — interstitial first,
//     download starts on dismiss (DirectInstallerModal startDownloadFlow).
//   * Download complete — interstitial after EVERY completed download
//     (App.tsx handleDownloadCompleted).
//   * Request submit — interstitial first, request sends on dismiss
//     (RequestAppModal handleSubmit).
//   * Rewarded — ONLY when the user himself taps "Boost" in the Request
//     App modal; the boost is applied only when Unity reports the
//     reward earned (watched to the end). Rewarded is never auto-shown.
// - Guardrail (the ONLY one): an ad must never BREAK the flow. Every
//   gated action awaits showInterstitialAd() and then continues
//   unconditionally — showInterstitialAd() never throws and resolves
//   false on no-fill/failure, so the action always proceeds. The
//   download/request still works after the ad is dismissed.
// - The Unity Game ID is a public identifier only (it cannot move
//   money or open the Unity account); payment stays tied to the
//   Unity account.
// ============================================================================

import { Capacitor } from '@capacitor/core';
import { UnityAds } from '@premium/unity-ads';

// *** [FILL IN] — REPLACE WITH THE REAL UNITY GAME ID BEFORE ANY APK BUILD ***
// The user must create the Unity app for Apna Jugaad in the Unity
// dashboard (like the 4 games) and paste its Android Game ID here.
// NEVER build an APK while this is still '[FILL IN]' and NEVER use a
// test ID — the build workflow fails loudly if this placeholder is
// still present. This is the ONLY place the Game ID lives.
export const UNITY_GAME_ID = '800457447';

export const UNITY_CONFIG = {
  gameId: UNITY_GAME_ID,
  // Same placement strings as the 4 games (the Game ID is what
  // distinguishes this app in Unity's dashboard).
  interstitialId: 'BP_Interstitial_Android',
  rewardedId: 'BP_Rewarded_Android',
  // NO banner placement — Premium is video ads only.
  // NO App Open placement — Unity Ads has no App Open format.
} as const;

let initialized = false;
let initPromise: Promise<boolean> | null = null;

function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** True only once the real Game ID has been pasted in. */
function hasRealGameId(): boolean {
  return (
    typeof UNITY_CONFIG.gameId === 'string' &&
    UNITY_CONFIG.gameId.length > 0 &&
    !UNITY_CONFIG.gameId.includes('[FILL IN]')
  );
}

/** Preload both video formats. Failures are swallowed — ads are optional. */
async function preloadAll(): Promise<void> {
  try {
    await UnityAds.loadInterstitial({ placementId: UNITY_CONFIG.interstitialId });
  } catch {
    /* no fill / offline — retry on next show attempt */
  }
  try {
    await UnityAds.loadRewarded({ placementId: UNITY_CONFIG.rewardedId });
  } catch {
    /* no fill / offline */
  }
}

/**
 * Initialise the Unity Ads SDK (best effort, never blocks).
 * Safe to call on the website too — it resolves false there.
 * Resolves false while the Game ID is still the [FILL IN] placeholder,
 * so a build with a placeholder can never initialise ads.
 */
export function initAds(): Promise<boolean> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!isNative()) return false;
    if (!hasRealGameId()) return false;
    try {
      const res = await UnityAds.initialize({
        gameId: UNITY_CONFIG.gameId,
        testMode: false,
      });
      if (!res?.initialized) return false;
      await preloadAll();
      initialized = true;
      return true;
    } catch {
      return false;
    }
  })();
  return initPromise;
}

/** Never let a show call hang the UI (120s safety cap). */
function withTimeout<T>(p: Promise<T>, ms = 120000): Promise<T | null> {
  return Promise.race([
    p,
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), ms);
    }),
  ]);
}

/**
 * Show an interstitial video ad. Resolves true when the ad was shown
 * and dismissed, false when no ad was available. Never throws, never
 * blocks the caller for long.
 */
export async function showInterstitialAd(): Promise<boolean> {
  try {
    if (!initialized) {
      const ok = await initAds();
      if (!ok) return false;
    }
    try {
      await UnityAds.loadInterstitial({ placementId: UNITY_CONFIG.interstitialId });
    } catch {
      return false;
    }
    try {
      const res = await withTimeout(
        UnityAds.showInterstitial({ placementId: UNITY_CONFIG.interstitialId }),
      );
      return res !== null;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Show a rewarded video ad. Resolves true ONLY when Unity reports the
 * reward earned (watched to the end). Closing early / no fill / any
 * error resolves false — the caller must grant nothing in that case.
 */
export async function showRewardedAd(): Promise<boolean> {
  try {
    if (!initialized) {
      const ok = await initAds();
      if (!ok) return false;
    }
    try {
      await UnityAds.loadRewarded({ placementId: UNITY_CONFIG.rewardedId });
    } catch {
      return false;
    }
    try {
      const res = await withTimeout(
        UnityAds.showRewarded({ placementId: UNITY_CONFIG.rewardedId }),
      );
      return res !== null && res.earned === true;
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
    UnityAdsNative?: {
      init: () => Promise<boolean>;
      showInterstitial: () => Promise<boolean>;
      showRewarded: () => Promise<boolean>;
    };
  }
}

if (typeof window !== 'undefined') {
  window.UnityAdsNative = {
    init: initAds,
    showInterstitial: showInterstitialAd,
    showRewarded: showRewardedAd,
  };
}
