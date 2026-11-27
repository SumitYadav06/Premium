export interface UnityAdsPlugin {
  /** Initialise the Unity Ads SDK. Resolves {initialized:true} only
      when the SDK reports onInitializationComplete. */
  initialize(options: { gameId: string; testMode: boolean }): Promise<{
    initialized: boolean;
    error?: string;
  }>;
  isInitialized(): Promise<{ initialized: boolean }>;
  loadInterstitial(options: { placementId: string }): Promise<void>;
  /** Resolves when the interstitial is dismissed (show complete).
      Rejects when the ad fails to show. */
  showInterstitial(options: { placementId: string }): Promise<{
    completed: boolean;
  }>;
  loadRewarded(options: { placementId: string }): Promise<void>;
  /** Resolves {earned:true} ONLY when the viewer watched to the end
      (COMPLETED). SKIPPED resolves {earned:false} — never a reward. */
  showRewarded(options: { placementId: string }): Promise<{
    earned: boolean;
  }>;
  // NOTE: no showBanner / hideBanner — Premium is VIDEO ADS ONLY.
  // No App Open either — Unity Ads has no App Open format.
}
