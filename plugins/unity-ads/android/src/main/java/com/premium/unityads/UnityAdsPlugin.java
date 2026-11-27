package com.premium.unityads;

import android.app.Activity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;

/**
 * Minimal Capacitor bridge for the Unity Ads Android SDK (4.x) —
 * Apna Jugaad (Premium Store).
 *
 * Adapted from the proven Dripply plugin
 * (github-staging/dripply/plugins/unity-ads). VIDEO ADS ONLY — the
 * banner methods were removed on purpose: Premium shows no banner,
 * ever. No App Open either — Unity has no App Open format.
 *
 * Exposes exactly what the store needs, nothing more:
 *  initialize  - UnityAds.initialize(gameId, testMode)
 *  loadInterstitial / showInterstitial - load-then-show, resolves when
 *      the ad is dismissed (show complete), rejects on show failure
 *  loadRewarded / showRewarded - resolves {earned:true} only when the
 *      viewer watched to the end (COMPLETED); SKIPPED resolves
 *      {earned:false} and never grants a reward
 *
 * All Unity calls run on the UI thread. The Game ID and placement IDs
 * are passed in from JS (src/ads.ts), so this file has no ad IDs of
 * its own.
 *
 * Capacitor 8 notes (vs the games' Capacitor 6 plugin):
 *  - Plugin / PluginMethod / PluginCall / JSObject / @CapacitorPlugin
 *    API is unchanged in Capacitor 8 — no Java call-site changes.
 *  - compileSdk/targetSdk raised 34 -> 35 to match Capacitor 8's
 *    Android SDK 35 host app (see android/build.gradle).
 *  - minSdk 26: the Capacitor 8 generated project still resolves to
 *    24, so the workflow MUST raise it to 26 (same manifest-merger
 *    fix as the games, which raised 22 -> 26); verified in the
 *    scratch `cap sync` test — without the raise the build fails.
 */
@CapacitorPlugin(name = "UnityAds")
public class UnityAdsPlugin extends Plugin {

    private boolean initialized = false;
    private PluginCall pendingInitCall = null;

    private void runOnUi(Runnable r) {
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(r);
        } else {
            r.run();
        }
    }

    @PluginMethod
    public void isInitialized(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("initialized", initialized);
        call.resolve(ret);
    }

    @PluginMethod
    public void initialize(final PluginCall call) {
        if (initialized) {
            JSObject ret = new JSObject();
            ret.put("initialized", true);
            call.resolve(ret);
            return;
        }
        if (pendingInitCall != null) {
            // An init is already in flight; the first caller gets the
            // result. This caller gets a retryable "not ready" answer
            // instead of a second parallel initialize (the SDK ignores
            // duplicate initialize calls anyway).
            JSObject ret = new JSObject();
            ret.put("initialized", false);
            ret.put("error", "init already in progress");
            call.resolve(ret);
            return;
        }
        final String gameId = call.getString("gameId");
        final boolean testMode = Boolean.TRUE.equals(call.getBoolean("testMode", false));
        if (gameId == null || gameId.isEmpty()) {
            call.reject("initialize: gameId is required");
            return;
        }
        pendingInitCall = call;
        runOnUi(new Runnable() {
            @Override
            public void run() {
                Activity activity = getActivity();
                if (activity == null) {
                    PluginCall c = pendingInitCall;
                    pendingInitCall = null;
                    if (c != null) {
                        c.reject("initialize: no activity");
                    }
                    return;
                }
                UnityAds.initialize(
                    activity.getApplicationContext(),
                    gameId,
                    testMode,
                    new IUnityAdsInitializationListener() {
                        @Override
                        public void onInitializationComplete() {
                            initialized = true;
                            PluginCall c = pendingInitCall;
                            pendingInitCall = null;
                            if (c != null) {
                                JSObject ret = new JSObject();
                                ret.put("initialized", true);
                                c.resolve(ret);
                            }
                        }

                        @Override
                        public void onInitializationFailed(
                                UnityAds.UnityAdsInitializationError error, String message) {
                            PluginCall c = pendingInitCall;
                            pendingInitCall = null;
                            if (c != null) {
                                JSObject ret = new JSObject();
                                ret.put("initialized", false);
                                ret.put("error", message != null ? message : String.valueOf(error));
                                c.resolve(ret);
                            }
                        }
                    });
            }
        });
    }

    @PluginMethod
    public void loadInterstitial(final PluginCall call) {
        final String placementId = call.getString("placementId");
        if (placementId == null || placementId.isEmpty()) {
            call.reject("loadInterstitial: placementId is required");
            return;
        }
        runOnUi(new Runnable() {
            @Override
            public void run() {
                UnityAds.load(placementId, new com.unity3d.ads.UnityAdsLoadOptions(),
                    new IUnityAdsLoadListener() {
                        @Override
                        public void onUnityAdsAdLoaded(String placementId) {
                            call.resolve();
                        }

                        @Override
                        public void onUnityAdsFailedToLoad(String placementId,
                                UnityAds.UnityAdsLoadError error, String message) {
                            call.reject(message != null ? message : String.valueOf(error));
                        }
                    });
            }
        });
    }

    @PluginMethod
    public void showInterstitial(final PluginCall call) {
        final String placementId = call.getString("placementId");
        if (placementId == null || placementId.isEmpty()) {
            call.reject("showInterstitial: placementId is required");
            return;
        }
        runOnUi(new Runnable() {
            @Override
            public void run() {
                final Activity activity = getActivity();
                if (activity == null) {
                    call.reject("showInterstitial: no activity");
                    return;
                }
                UnityAds.show(activity, placementId, new com.unity3d.ads.UnityAdsShowOptions(),
                    new IUnityAdsShowListener() {
                        @Override
                        public void onUnityAdsShowFailure(String placementId,
                                UnityAds.UnityAdsShowError error, String message) {
                            call.reject(message != null ? message : String.valueOf(error));
                        }

                        @Override
                        public void onUnityAdsShowStart(String placementId) {
                        }

                        @Override
                        public void onUnityAdsShowClick(String placementId) {
                        }

                        @Override
                        public void onUnityAdsShowComplete(String placementId,
                                UnityAds.UnityAdsShowCompletionState state) {
                            JSObject ret = new JSObject();
                            ret.put("completed",
                                state == UnityAds.UnityAdsShowCompletionState.COMPLETED);
                            call.resolve(ret);
                        }
                    });
            }
        });
    }

    @PluginMethod
    public void loadRewarded(final PluginCall call) {
        final String placementId = call.getString("placementId");
        if (placementId == null || placementId.isEmpty()) {
            call.reject("loadRewarded: placementId is required");
            return;
        }
        runOnUi(new Runnable() {
            @Override
            public void run() {
                UnityAds.load(placementId, new com.unity3d.ads.UnityAdsLoadOptions(),
                    new IUnityAdsLoadListener() {
                        @Override
                        public void onUnityAdsAdLoaded(String placementId) {
                            call.resolve();
                        }

                        @Override
                        public void onUnityAdsFailedToLoad(String placementId,
                                UnityAds.UnityAdsLoadError error, String message) {
                            call.reject(message != null ? message : String.valueOf(error));
                        }
                    });
            }
        });
    }

    @PluginMethod
    public void showRewarded(final PluginCall call) {
        final String placementId = call.getString("placementId");
        if (placementId == null || placementId.isEmpty()) {
            call.reject("showRewarded: placementId is required");
            return;
        }
        runOnUi(new Runnable() {
            @Override
            public void run() {
                final Activity activity = getActivity();
                if (activity == null) {
                    call.reject("showRewarded: no activity");
                    return;
                }
                UnityAds.show(activity, placementId, new com.unity3d.ads.UnityAdsShowOptions(),
                    new IUnityAdsShowListener() {
                        @Override
                        public void onUnityAdsShowFailure(String placementId,
                                UnityAds.UnityAdsShowError error, String message) {
                            call.reject(message != null ? message : String.valueOf(error));
                        }

                        @Override
                        public void onUnityAdsShowStart(String placementId) {
                        }

                        @Override
                        public void onUnityAdsShowClick(String placementId) {
                        }

                        @Override
                        public void onUnityAdsShowComplete(String placementId,
                                UnityAds.UnityAdsShowCompletionState state) {
                            JSObject ret = new JSObject();
                            // The reward is earned ONLY on COMPLETED.
                            // SKIPPED resolves earned:false and the
                            // store grants nothing.
                            ret.put("earned",
                                state == UnityAds.UnityAdsShowCompletionState.COMPLETED);
                            call.resolve(ret);
                        }
                    });
            }
        });
    }
}
