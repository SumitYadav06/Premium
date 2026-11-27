// Hand-written equivalent of the `tsc` output for src/index.ts + src/web.ts
// (kept in sync by hand; the store loads the native plugin through the
// Capacitor bridge, this bundle is the web fallback + package entry).
// ESM (package.json has "type": "module") so Vite/Rollup can import it
// directly — the games' CJS copy does not build under Vite.
import { registerPlugin, WebPlugin } from '@capacitor/core';

export class UnityAdsWeb extends WebPlugin {
  async initialize() {
    return { initialized: false, error: 'Unity Ads is not available on web' };
  }
  async isInitialized() {
    return { initialized: false };
  }
  async loadInterstitial() {
    throw new Error('Unity Ads is not available on web');
  }
  async showInterstitial() {
    throw new Error('Unity Ads is not available on web');
  }
  async loadRewarded() {
    throw new Error('Unity Ads is not available on web');
  }
  async showRewarded() {
    throw new Error('Unity Ads is not available on web');
  }
}

export const UnityAds = registerPlugin('UnityAds', {
  web: () => Promise.resolve(new UnityAdsWeb()),
});
