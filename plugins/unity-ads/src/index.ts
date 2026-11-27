import { registerPlugin } from '@capacitor/core';

import type { UnityAdsPlugin } from './definitions';

const UnityAds = registerPlugin<UnityAdsPlugin>('UnityAds', {
  web: () => import('./web').then((m) => new m.UnityAdsWeb()),
});

export * from './definitions';
export { UnityAds };
