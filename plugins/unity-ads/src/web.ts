import { WebPlugin } from '@capacitor/core';

import type { UnityAdsPlugin } from './definitions';

/** Web fallback: Unity Ads is a native SDK and cannot run in a
    browser. Every call fails honestly so the store treats ads as
    unavailable (website preview only, never presented as a real ad). */
export class UnityAdsWeb extends WebPlugin implements UnityAdsPlugin {
  async initialize(): Promise<{ initialized: boolean; error?: string }> {
    return { initialized: false, error: 'Unity Ads is not available on web' };
  }

  async isInitialized(): Promise<{ initialized: boolean }> {
    return { initialized: false };
  }

  async loadInterstitial(): Promise<void> {
    throw new Error('Unity Ads is not available on web');
  }

  async showInterstitial(): Promise<{ completed: boolean }> {
    throw new Error('Unity Ads is not available on web');
  }

  async loadRewarded(): Promise<void> {
    throw new Error('Unity Ads is not available on web');
  }

  async showRewarded(): Promise<{ earned: boolean }> {
    throw new Error('Unity Ads is not available on web');
  }
}
