import React, { useState, useEffect, useMemo } from 'react';
import { AppItem, AppStats, DownloadTask } from './types';
import {
  subscribeToApps,
  addAppReview,
  incrementAppDownload,
  incrementAppView,
  recordDailyVisit,
  getAppKey
} from './services/firebase';
import { STORE_CONFIG } from './config';
import { showInterstitialAd } from './ads';
import { shareApp } from './utils/shareApp';
import { detectApkShellState } from './utils/forceUpdate';
import { decideDownloadGate } from './services/nativeDownload';
import { isBackgroundDownloadAvailable, requestNotificationPermission } from './services/backgroundDownload';
import { ForceUpdateBlocker } from './components/ForceUpdateBlocker';
import { InternetGate } from './components/InternetGate';
import { fetchReleaseApps } from './services/githubApps';
import { Navbar } from './components/Navbar';
import { BannerSlider } from './components/BannerSlider';
import { CategoryPills } from './components/CategoryPills';
import { AppCard } from './components/AppCard';
import { StoreUpdateModal } from './components/StoreUpdateModal';

// Bade screens pehle load me NAHI aate — sirf tap karne par download hote hain.
// Isse app ka pehla khulna bahut tez ho jata hai (halka pehla bundle).
const AppDetailView = React.lazy(() => import('./components/AppDetailView').then((m) => ({ default: m.AppDetailView })));
const DirectInstallerModal = React.lazy(() => import('./components/DirectInstallerModal').then((m) => ({ default: m.DirectInstallerModal })));
const DownloadManagerDrawer = React.lazy(() => import('./components/DownloadManagerDrawer').then((m) => ({ default: m.DownloadManagerDrawer })));
const BookmarksDrawer = React.lazy(() => import('./components/BookmarksDrawer').then((m) => ({ default: m.BookmarksDrawer })));
const InstallGuideModal = React.lazy(() => import('./components/InstallGuideModal').then((m) => ({ default: m.InstallGuideModal })));
const OwnerModal = React.lazy(() => import('./components/OwnerModal').then((m) => ({ default: m.OwnerModal })));
const AdminModal = React.lazy(() => import('./components/AdminModal').then((m) => ({ default: m.AdminModal })));
const RequestAppModal = React.lazy(() => import('./components/RequestAppModal').then((m) => ({ default: m.RequestAppModal })));
const WebApkPromptModal = React.lazy(() => import('./components/WebApkPromptModal').then((m) => ({ default: m.WebApkPromptModal })));

const ChunkLoader: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-[3px] border-fuchsia-500/25 border-t-fuchsia-500 animate-spin" />
  </div>
);
import { SplashView } from './components/SplashView';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import {
  LiveBackground,
  TopChartsRail,
  RecentlyViewedRow,
  BottomDock
} from './components/LiveStage';
import {
  Search,
  ArrowUpDown,
  HelpCircle,
  Package,
  Mic,
  MicOff,
  X as XIcon,
  Flame,
  ArrowUp,
  RefreshCw,
  Store,
  Bookmark
} from 'lucide-react';

export default function App() {
  // Store Data & Realtime State - Instant load from cached real apps
  const [apps, setApps] = useState<AppItem[]>(() => {
    try {
      const cached = localStorage.getItem('premium_store_cached_apps');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      const custom = localStorage.getItem('premium_store_custom_apps');
      if (custom) {
        const parsedCustom = JSON.parse(custom);
        if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
          return parsedCustom;
        }
      }
    } catch (e) {}
    return [];
  });
  const [stats, setStats] = useState<Record<string, AppStats>>({});
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('premium_store_cached_apps');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const [showSplash, setShowSplash] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Roz ka visitor ping — ek device se ek din me sirf ek baar (weekly/monthly users ke liye)
  useEffect(() => {
    recordDailyVisit();
  }, []);

  // Notification permission — pehli baar app khulte hi turant maango (Android 13+).
  // Download % wali notification ke liye chahiye. Ab tak sirf download ke time
  // poochte the, isliye user ko kabhi prompt dikha hi nahi. Sirf ek baar —
  // localStorage flag se dobara nahi poochte. Native shell me hi (website par
  // plugin nahi hota, wahan kuch nahi hota). User mana kare to bhi download
  // chalega, bas % notification nahi dikhega — download ke time modal phir
  // ek baar pooch lega (wo purana fallback waise hi hai).
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (window.localStorage.getItem('aj-notif-permission-asked') === '1') return;
      if (!isBackgroundDownloadAvailable()) return;
      window.localStorage.setItem('aj-notif-permission-asked', '1');
      void requestNotificationPermission();
    } catch {
      /* flag na bache to agle launch par phir try hoga — app nahi toot-ta */
    }
  }, []);

  // FORCE UPDATE — purana APK pehchano aur store block karo.
  // Detection: native shell + (Unity Ads plugin NAHI ya versionCode <
  // MIN_SUPPORTED_BUILD) = purana APK. Sirf sabse naya build chalta hai.
  // 5 second tak har 250ms check karo (bridge aane me der ho sakti hai);
  // do baar lagatar "old-apk" mile tabhi block karo; bridge na mile ya
  // naya APK / browser ho to store dikhao (fail open — kabhi brick nahi).
  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;
    let confirmations = 0;
    const deadline = Date.now() + 5000;
    const tick = async () => {
      if (stopped) return;
      const state = await detectApkShellState();
      if (state === 'new-or-browser') {
        stopped = true;
        return;
      }
      if (state === 'old-apk') {
        confirmations += 1;
        if (confirmations >= 2) {
          stopped = true;
          setForceUpdateBlocked(true);
          return;
        }
      } else {
        confirmations = 0;
      }
      if (Date.now() >= deadline) {
        stopped = true;
        return;
      }
      timer = window.setTimeout(tick, 250);
    };
    timer = window.setTimeout(tick, 250);
    return () => {
      stopped = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  // Offline indicator — net jaate hi halka banner, taaki user samjhe
  // ki naye apps load nahi ho rahe (pehle se loaded list dikhti rahegi).
  // Internet gate: offline hote hi poora store block hota hai
  // (InternetGate overlay) — sirf navigator.onLine, koi fetch/ping nahi.
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const recheckOnline = () => setIsOnline(navigator.onLine);
  useEffect(() => {
    const goOn = () => setIsOnline(true);
    const goOff = () => setIsOnline(false);
    // App par wapas aate hi dobara check karo (data beech me on ho gaya ho to gate khud hat jaye).
    const onVis = () => {
      if (document.visibilityState === 'visible') setIsOnline(navigator.onLine);
    };
    window.addEventListener('online', goOn);
    window.addEventListener('offline', goOff);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('online', goOn);
      window.removeEventListener('offline', goOff);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // UI Filters
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Search button / keyboard "Search" key par mobile keyboard band karo (YouTube jaisa).
  // Instant search waise hi chalta hai — sirf keyboard dismiss hota hai.
  const dismissSearchKeyboard = (e: React.FormEvent) => {
    e.preventDefault();
    searchInputRef.current?.blur();
  };
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'trending' | 'downloads' | 'rating' | 'size' | 'name' | 'newest'>('trending');
  // Sirf saved (bookmark) apps dikhao — home list ka filter chip.
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  // Card share ka chhota toast ("copy ho gaya" jaisi feedback).
  const [shareToast, setShareToast] = useState<string | null>(null);
  // Purana 5 MB APK — confirm hone par poora store block hota hai.
  const [forceUpdateBlocked, setForceUpdateBlocked] = useState(false);

  // Voice Search Handler with Multi-language (Hindi + English) & Permission Handling
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);

  const toggleVoiceSearch = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceStatus("Voice search is not supported in this browser. Please use Chrome/Edge or type to search.");
      setTimeout(() => setVoiceStatus(null), 4000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
      setVoiceStatus(null);
      return;
    }

    try {
      // First ask for explicit microphone permission if browser supports mediaDevices
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop immediately as recognition handles its own stream
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          console.warn('Microphone permission warning:', permErr);
          if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
            setVoiceStatus("Microphone permission denied. Please allow mic access in your browser settings.");
            setTimeout(() => setVoiceStatus(null), 4500);
            return;
          }
        }
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      // Auto-detect browser language or default to Hindi/English bilingual mix
      const userLang = navigator.language || 'hi-IN';
      recognition.lang = userLang.startsWith('hi') ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus("🎤 Listening... Speak now (English / Hindi)...");
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setSearchQuery(currentTranscript);
          setVoiceStatus(`Recognized: "${currentTranscript}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceStatus("Microphone access denied. Please click lock icon in address bar to allow mic.");
        } else if (event.error === 'no-speech') {
          setVoiceStatus("No speech detected. Please tap mic and try speaking again.");
        } else if (event.error === 'network') {
          setVoiceStatus("Voice search network error. Please check your internet connection.");
        } else {
          setVoiceStatus(`Voice recognition stopped (${event.error || 'try again'}).`);
        }
        setTimeout(() => setVoiceStatus(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => setVoiceStatus(null), 2500);
      };

      recognition.start();
    } catch (e: any) {
      console.error('Speech recognition start failed:', e);
      setIsListening(false);
      setVoiceStatus("Could not start microphone. Please check browser permissions.");
      setTimeout(() => setVoiceStatus(null), 4000);
    }
  };

  // Auto-dismiss Splash screen failsafe timer — 1600ms se 1000ms:
  // splash brand dikhata hai, par store usse pehle usable hona chahiye.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // AUTO-UPDATE: WebView cache me purana version atka ho to khud pehchano aur fresh load karo.
  // Live index.html (no-store) se naya bundle hash padho; alag ho to ek baar reload.
  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const res = await fetch(`/Premium/?aj_check=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const html = await res.text();
        const m = html.match(/assets\/index-[A-Za-z0-9_-]+\.js/);
        if (!m) return;
        const current =
          document.querySelector('script[src*="assets/index-"]')?.getAttribute('src') || '';
        if (current && !current.includes(m[0])) {
          const KEY = 'aj_update_reloaded_for';
          if (sessionStorage.getItem(KEY) !== m[0]) {
            sessionStorage.setItem(KEY, m[0]);
            window.location.reload();
          }
        }
      } catch (e) {}
    };
    const t = setTimeout(checkUpdate, 2500);
    const onVis = () => {
      if (document.visibilityState === 'visible') checkUpdate();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearTimeout(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Navigation & Modals
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [directInstallApp, setDirectInstallApp] = useState<AppItem | null>(null);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  // WEB GATE (2026-11-27): web visitor ne Download dabaya — APK-install prompt.
  // Sirf tap par khulta hai, page load par kabhi nahi; APK shell me kabhi nahi.
  const [isWebApkPromptOpen, setIsWebApkPromptOpen] = useState(false);

  // Synchronized State References to avoid stale closures in event listeners
  const selectedAppRef = React.useRef<AppItem | null>(null);
  selectedAppRef.current = selectedApp;

  const directInstallAppRef = React.useRef<AppItem | null>(null);
  directInstallAppRef.current = directInstallApp;

  const isDownloadsOpenRef = React.useRef(isDownloadsOpen);
  isDownloadsOpenRef.current = isDownloadsOpen;

  const isBookmarksOpenRef = React.useRef(isBookmarksOpen);
  isBookmarksOpenRef.current = isBookmarksOpen;

  const isInstallGuideOpenRef = React.useRef(isInstallGuideOpen);
  isInstallGuideOpenRef.current = isInstallGuideOpen;

  const isOwnerModalOpenRef = React.useRef(isOwnerModalOpen);
  isOwnerModalOpenRef.current = isOwnerModalOpen;

  const isAdminOpenRef = React.useRef(isAdminOpen);
  isAdminOpenRef.current = isAdminOpen;

  const isRequestOpenRef = React.useRef(isRequestOpen);
  isRequestOpenRef.current = isRequestOpen;

  // Recently Viewed (Local storage) — "Jump Back In" row ke liye
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('premium_store_recent') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('premium_store_recent', JSON.stringify(recentIds));
  }, [recentIds]);

  // View Openers & Closers with Automatic Browser / Android History Pushes
  // MAX ADS (user, 2026-11-27): detail khulne se PEHLE ek interstitial —
  // ad dismiss ho ya na mile, detail hamesha khulta hai (flow kabhi nahi
  // toot-ta: showInterstitialAd() har haal me resolve hota hai).
  const openAppDetail = async (app: AppItem) => {
    await showInterstitialAd();
    incrementAppView(app.id || app.name);
    setRecentIds((prev) => [app.id, ...prev.filter((id) => id !== app.id)].slice(0, 10));
    setSelectedApp(app);
    // Detail hamesha TOP se khule — purani scroll position par nahi
    requestAnimationFrame(() => window.scrollTo(0, 0));
    window.scrollTo(0, 0);
    try {
      window.history.pushState({ view: 'app_detail', id: app.id || app.name }, '');
    } catch (e) {}
  };

  const closeAppDetail = () => {
    if (selectedAppRef.current) {
      setSelectedApp(null);
      if (window.history.state?.view === 'app_detail') {
        try {
          window.history.back();
        } catch (e) {}
      }
    }
  };

  const openInstallGuide = () => {
    setIsInstallGuideOpen(true);
    try {
      window.history.pushState({ view: 'install_guide' }, '');
    } catch (e) {}
  };

  const closeInstallGuide = () => {
    setIsInstallGuideOpen(false);
    if (window.history.state?.view === 'install_guide') {
      try {
        window.history.back();
      } catch (e) {}
    }
  };

  const openBookmarks = () => {
    setIsBookmarksOpen(true);
    try {
      window.history.pushState({ view: 'bookmarks' }, '');
    } catch (e) {}
  };

  const closeBookmarks = () => {
    setIsBookmarksOpen(false);
    if (window.history.state?.view === 'bookmarks') {
      try {
        window.history.back();
      } catch (e) {}
    }
  };

  const openDownloads = () => {
    setIsDownloadsOpen(true);
    try {
      window.history.pushState({ view: 'downloads' }, '');
    } catch (e) {}
  };

  const closeDownloads = () => {
    setIsDownloadsOpen(false);
    if (window.history.state?.view === 'downloads') {
      try {
        window.history.back();
      } catch (e) {}
    }
  };

  const openOwnerModal = () => {
    setIsOwnerModalOpen(true);
    try {
      window.history.pushState({ view: 'owner' }, '');
    } catch (e) {}
  };

  const closeOwnerModal = () => {
    setIsOwnerModalOpen(false);
    if (window.history.state?.view === 'owner') {
      try {
        window.history.back();
      } catch (e) {}
    }
  };

  const openAdmin = () => {
    setIsAdminOpen(true);
    try {
      window.history.pushState({ view: 'admin' }, '');
    } catch (e) {}
  };

  const closeAdmin = () => {
    setIsAdminOpen(false);
    if (window.history.state?.view === 'admin') {
      try {
        window.history.back();
      } catch (e) {}
    }
  };

  const openRequest = () => {
    setIsRequestOpen(true);
    try {
      window.history.pushState({ view: 'request' }, '');
    } catch (e) {}
  };

  const closeRequest = () => {
    setIsRequestOpen(false);
    if (window.history.state?.view === 'request') {
      try {
        window.history.back();
      } catch (e) {}
    }
  };


  // Dock ka Home button: home par pehle se ho aur upar hi ho to REFRESH,
  // warna aaram se home + sabse upar
  const handleDockHome = () => {
    const alreadyHome =
      !selectedApp && !searchQuery.trim() && selectedCategory === 'All' && window.scrollY < 10;
    closeAppDetail();
    setSearchQuery('');
    setSelectedCategory('All');
    if (alreadyHome) {
      window.location.reload();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDirectInstaller = (app: AppItem) => {
    // WEB GATE: website sirf catalogue hai — web visitor ko installer modal
    // aur browser download nahi, APK-install prompt dikhao.
    if (decideDownloadGate() !== 'native') {
      setIsWebApkPromptOpen(true);
      return;
    }
    setDirectInstallApp(app);
    try {
      window.history.pushState({ view: 'installer' }, '');
    } catch (e) {}
  };

  const closeDirectInstaller = () => {
    setDirectInstallApp(null);
    if (window.history.state?.view === 'installer') {
      try {
        window.history.back();
      } catch (e) {}
    }
  };

  // Android Hardware / Gesture Navigation popstate listener with bulletproof history management
  useEffect(() => {
    // Initialize base history state + ek GUARD entry:
    // taaki pehla Back hamesha is guard par land kare, app se bahar kabhi na jaye
    if (!window.history.state || !window.history.state.premium_app) {
      try {
        window.history.replaceState({ premium_app: true, view: 'home' }, '');
        window.history.pushState({ premium_app: true, view: 'home_guard' }, '');
      } catch (e) {}
    }

    const handlePopState = (event: PopStateEvent) => {
      // Check if any sub-modal or detail view is currently open
      const hasOpenViews =
        isAdminOpenRef.current ||
        isRequestOpenRef.current ||
        isInstallGuideOpenRef.current ||
        isOwnerModalOpenRef.current ||
        isBookmarksOpenRef.current ||
        isDownloadsOpenRef.current ||
        directInstallAppRef.current ||
        selectedAppRef.current;

      if (hasOpenViews) {
        // Ek Back = sirf EK step: sabse upar wala view band karo
        if (isAdminOpenRef.current) {
          setIsAdminOpen(false);
        } else if (isRequestOpenRef.current) {
          setIsRequestOpen(false);
        } else if (isInstallGuideOpenRef.current) {
          setIsInstallGuideOpen(false);
        } else if (isOwnerModalOpenRef.current) {
          setIsOwnerModalOpen(false);
        } else if (isBookmarksOpenRef.current) {
          setIsBookmarksOpen(false);
        } else if (isDownloadsOpenRef.current) {
          setIsDownloadsOpen(false);
        } else if (directInstallAppRef.current) {
          setDirectInstallApp(null);
        } else if (selectedAppRef.current) {
          // Close app detail view and return to main home screen
          setSelectedApp(null);
        }
      }

      // HAMESHA ek fresh guard entry push karo — history kabhi khaali nahi hogi,
      // isliye ek Back dabane se app seedha band nahi hoga
      try {
        window.history.pushState({ premium_app: true, view: 'home_guard' }, '');
      } catch (e) {}
    };

    window.addEventListener('popstate', handlePopState);

    // Extra safety: agar WebView purani session/cache se restore ho (pageshow persisted)
    // ya pehla tap ho jaye, guard entry dobara seed kar do — Back hamesha app ke andar rahe
    const seedGuard = () => {
      try {
        window.history.pushState({ premium_app: true, view: 'home_guard' }, '');
      } catch (e) {}
    };
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) seedGuard();
    };
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pointerdown', seedGuard, { once: true });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pointerdown', seedGuard);
    };
  }, []);

  // Bookmarks (Local storage)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('premium_store_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  // Downloads History Task list
  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('premium_store_download_tasks') || '[]');
    } catch {
      return [];
    }
  });

  // Realtime Firebase Listener
  useEffect(() => {
    const unsub = subscribeToApps(
      (loadedApps) => {
        setApps(loadedApps);
        setLoading(false);
      },
      (loadedStats) => {
        setStats(loadedStats);
      }
    );

    // Network slow ho to loading par atka mat rakho — 8 second me screen khol do,
    // data jaise hi aayega, apps apne aap dikhne lagenge
    const loadingTimer = setTimeout(() => setLoading(false), 8000);
    return () => {
      unsub();
      clearTimeout(loadingTimer);
    };
  }, []);

  // Save Bookmarks
  useEffect(() => {
    localStorage.setItem('premium_store_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Save Tasks
  useEffect(() => {
    localStorage.setItem('premium_store_download_tasks', JSON.stringify(downloadTasks));
  }, [downloadTasks]);

  // Pull-to-refresh: page sabse upar ho tab neeche kheenchne par refresh.
  // Koi modal/drawer khula ho to engage nahi hota.
  const pullDistRef = React.useRef(0);
  const [pullUi, setPullUi] = useState(0);
  const [ptrRefreshing, setPtrRefreshing] = useState(false);
  useEffect(() => {
    let startY: number | null = null;
    const anyOverlayOpen = () =>
      isAdminOpenRef.current ||
      isRequestOpenRef.current ||
      isOwnerModalOpenRef.current ||
      isBookmarksOpenRef.current ||
      isDownloadsOpenRef.current ||
      isInstallGuideOpenRef.current;
    const onStart = (e: TouchEvent) => {
      startY = window.scrollY <= 0 && !anyOverlayOpen() ? e.touches[0].clientY : null;
    };
    const onMove = (e: TouchEvent) => {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0 && window.scrollY <= 0) {
        const d = Math.min(dy * 0.5, 90);
        pullDistRef.current = d;
        setPullUi(d);
        if (dy > 8 && e.cancelable) e.preventDefault();
      } else if (pullDistRef.current !== 0) {
        pullDistRef.current = 0;
        setPullUi(0);
      }
    };
    const onEnd = () => {
      if (startY !== null && pullDistRef.current > 60) {
        setPtrRefreshing(true);
        setTimeout(() => window.location.reload(), 400);
      }
      startY = null;
      pullDistRef.current = 0;
      setPullUi(0);
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  // GitHub Releases se auto-listed apps — owner saare APK wahi upload karta hai,
  // store khud unhe utha kar list kar deta hai (10 min cache, service ke andar)
  const [releaseApps, setReleaseApps] = useState<AppItem[]>([]);
  useEffect(() => {
    let alive = true;
    fetchReleaseApps()
      .then((list) => {
        if (alive) setReleaseApps(list);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Release apps jo owner ne Admin Panel se is phone par hide kar diye
  const [hiddenLinks, setHiddenLinks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('premium_store_hidden_links') || '[]');
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('premium_store_hidden_links', JSON.stringify(hiddenLinks));
    } catch (e) {}
  }, [hiddenLinks]);

  // Safe Apps Array: SIRF Firebase apps (Admin Panel wale).
  // GitHub Release wale apps jo Admin me nahi hain (jaise Worms Zone,
  // Raat Raani) ab bilkul nahi dikhenge — Admin hi ek source of truth hai.
  // (Pehle release-only apps "ghosts" bankar list me aa jate the — wahi
  // Worms Zone dikhta tha; refresh par pehle Firebase load hota tha isliye
  // ek pal ke liye gayab hokar phir aa jata tha.)
  const safeAppsList = useMemo(() => {
    const base = Array.isArray(apps) ? apps : [];
    return base;
  }, [apps]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    safeAppsList.forEach((a) => {
      if (a && a.cat) set.add(a.cat);
    });
    return Array.from(set);
  }, [safeAppsList]);

  // Count apps per category
  const appsCountByCategory = useMemo(() => {
    const counts: Record<string, number> = { All: safeAppsList.length };
    safeAppsList.forEach((a) => {
      if (a && a.cat) {
        counts[a.cat] = (counts[a.cat] || 0) + 1;
      }
    });
    return counts;
  }, [safeAppsList]);

  // Toggle Bookmark
  const handleToggleBookmark = (app: AppItem) => {
    setBookmarkedIds((prev) =>
      Array.isArray(prev)
        ? (prev.includes(app.id) ? prev.filter((id) => id !== app.id) : [...prev, app.id])
        : [app.id]
    );
  };

  // Card se share — native share sheet, nahi to clipboard copy + toast.
  const handleShareApp = async (app: AppItem) => {
    const result = await shareApp(app);
    if (result === 'copied') {
      setShareToast('Share link copy ho gaya!');
      window.setTimeout(() => setShareToast(null), 2500);
    } else if (result === 'failed') {
      setShareToast('Share nahi ho paya — dobara try karo');
      window.setTimeout(() => setShareToast(null), 2500);
    }
    // 'shared' par native sheet khud feedback deti hai — toast nahi chahiye.
  };

  // Interstitial video ad — HAR download pura hone par (MAX ADS, user
  // 2026-11-27: paid cheezein free milti hain, isliye users ads dekhne
  // ko taiyaar hain). Fire-and-forget: ad na mile to kuch nahi hota.
  const handleDownloadCompleted = (task?: DownloadTask) => {
    try {
      void showInterstitialAd();
    } catch {
      /* ads are optional — never break the store */
    }
    // Download drawer me task ko poora mark karo (version bhi update).
    if (task) {
      setDownloadTasks((prev) =>
        Array.isArray(prev)
          ? prev.map((t) =>
              t.appId === task.appId
                ? { ...t, progress: 100, status: 'ready', version: task.version, completedAt: Date.now() }
                : t
            )
          : prev
      );
    }
  };

  // Installer modal se live progress — drawer me % dikhta hai, modal
  // band karke bhi download ki halat pata chalti rehti hai.
  const handleDownloadStarted = (task: DownloadTask) => {
    setDownloadTasks((prev) => [
      task,
      ...(Array.isArray(prev) ? prev.filter((t) => t.appId !== task.appId) : [])
    ]);
  };

  const handleDownloadProgress = (appId: string, progress: number, downloadedMb: number, speed: string, etaSeconds: number) => {
    setDownloadTasks((prev) =>
      Array.isArray(prev)
        ? prev.map((t) =>
            t.appId === appId && t.status === 'downloading'
              ? { ...t, progress, downloadedBytes: downloadedMb * 1024 * 1024, speed: `${speed} • ${etaSeconds}s` }
              : t
          )
        : prev
    );
  };

  // Start Download / Direct Installer
  // MAX ADS (user, 2026-11-27): Download tap par PEHLE ek interstitial —
  // ad dismiss ho ya na mile, installer modal hamesha khulta hai.
  const handleQuickDownload = async (app: AppItem) => {
    // WEB GATE: web visitor ko na interstitial dikhao, na download count
    // badhao, na installer kholo — sirf APK-install prompt dikhao.
    // APK shell ke andar neeche wala normal flow bilkul waisa hi chalega.
    if (decideDownloadGate() !== 'native') {
      setIsWebApkPromptOpen(true);
      return;
    }
    incrementAppDownload(app.id);
    await showInterstitialAd();
    // Task ab installer modal banata hai (onDownloadStarted) jab download
    // sach me shuru hota hai — pehle yahan turant 100% wala nakli task
    // banta tha, drawer me jhootha "ready" dikhta tha.
    setDirectInstallApp(app);
  };

  // Filter and Sort Apps
  const filteredApps = useMemo(() => {
    let list = [...safeAppsList];

    if (selectedCategory !== 'All') {
      list = list.filter((a) => a && a.cat && a.cat.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a &&
          ((a.name && a.name.toLowerCase().includes(q)) ||
           (a.desc && a.desc.toLowerCase().includes(q)) ||
           (a.cat && a.cat.toLowerCase().includes(q)))
      );
    }

    // Saved-only filter chip — sirf bookmark wale apps dikhao.
    if (showSavedOnly) {
      list = list.filter((a) => a && Array.isArray(bookmarkedIds) && bookmarkedIds.includes(a.id));
    }

    // Newest: Firebase list oldest-first aati hai (push-key order), to
    // reverse karne se sabse naye add hue apps pehle aate hain. AppItem
    // me koi date field nahi hai, isliye yahi sabse sahi order hai.
    if (sortBy === 'newest') {
      list.reverse();
      return list;
    }

    list.sort((a, b) => {
      if (sortBy === 'trending') {
        const viewsA = stats[a.id]?.views || 0;
        const viewsB = stats[b.id]?.views || 0;
        return viewsB - viewsA;
      }
      if (sortBy === 'downloads') {
        const dA = (stats[a.id]?.downloads ?? a.downloads) || 0;
        const dB = (stats[b.id]?.downloads ?? b.downloads) || 0;
        return dB - dA;
      }
      if (sortBy === 'rating') {
        return (b.rating || 4.8) - (a.rating || 4.8);
      }
      if (sortBy === 'size') {
        return parseFloat(String(a.mb || '0')) - parseFloat(String(b.mb || '0'));
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    return list;
  }, [safeAppsList, selectedCategory, searchQuery, sortBy, stats, showSavedOnly, bookmarkedIds]);

  const trendingSearches = useMemo(() => {
    return [...safeAppsList]
      .filter((a) => a && a.name)
      .map((a) => ({
        name: a.name,
        dls: stats[a.id]?.downloads ?? stats[getAppKey(a.id)]?.downloads ?? stats[getAppKey(a.name)]?.downloads ?? a.downloads ?? 0,
      }))
      .sort((x, y) => y.dls - x.dls)
      .slice(0, 6)
      .map((x) => x.name);
  }, [safeAppsList, stats]);

  const bookmarkedApps = useMemo(() => {
    return safeAppsList.filter((a) => a && Array.isArray(bookmarkedIds) && bookmarkedIds.includes(a.id));
  }, [safeAppsList, bookmarkedIds]);

  // Live totals + Top Charts ranking (real stats se)
  const downloadsOf = (a: AppItem) =>
    stats[a.id]?.downloads ?? stats[getAppKey(a.id)]?.downloads ?? stats[getAppKey(a.name)]?.downloads ?? a.downloads ?? 0;

  const totalDownloads = useMemo(() => {
    return safeAppsList.reduce((sum, a) => sum + (a ? downloadsOf(a) : 0), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeAppsList, stats]);

  const rankedApps = useMemo(() => {
    return [...safeAppsList]
      .filter((a) => a && a.name)
      .map((a) => ({ app: a, downloads: downloadsOf(a) }))
      .sort((x, y) => y.downloads - x.downloads);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeAppsList, stats]);

  const recentApps = useMemo(() => {
    return recentIds
      .map((id) => safeAppsList.find((a) => a && a.id === id))
      .filter((a): a is AppItem => !!a)
      .slice(0, 8);
  }, [recentIds, safeAppsList]);

  // Rotating search placeholder — trending naam bari-bari dikhte hain
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  useEffect(() => {
    if (trendingSearches.length === 0) return;
    const t = setInterval(() => setPlaceholderIdx((i) => i + 1), 2600);
    return () => clearInterval(t);
  }, [trendingSearches.length]);

  const rotatingPlaceholder =
    trendingSearches.length > 0
      ? `Try "${trendingSearches[placeholderIdx % trendingSearches.length]}" — Mods, games, tools...`
      : 'Search Mods, games, premium tools...';

  // Synchronize open detail view with latest real-time data from store
  const currentSelectedApp = useMemo(() => {
    if (!selectedApp) return null;
    const found = safeAppsList.find(
      (a) => (a.id && a.id === selectedApp.id) || (a.name && a.name === selectedApp.name)
    );
    return found ? { ...selectedApp, ...found } : selectedApp;
  }, [selectedApp, safeAppsList]);

  // UPDATE badge: jis app ka purana version download ho chuka hai aur
  // store me naya version hai, uske card par UPDATE dikhega.
  const updateAppIds = useMemo(() => {
    const set = new Set<string>();
    if (!Array.isArray(downloadTasks)) return set;
    const done = new Map<string, string>();
    downloadTasks.forEach((t) => {
      if ((t.status === 'ready' || t.status === 'installed') && t.version) {
        done.set(t.appId, String(t.version));
      }
    });
    safeAppsList.forEach((a) => {
      const v = done.get(a.id);
      if (v && a.ver && v !== String(a.ver)) set.add(a.id);
    });
    return set;
  }, [downloadTasks, safeAppsList]);

  // Purana APK confirm ho gaya — poora store chhupao, sirf update blocker.
  // Offline ho to internet gate pehle: update download ke liye bhi net
  // chahiye, aur gate online hote hi khud hat jayega (tab blocker dikhega).
  // (Saare hooks upar call ho chuke hain, isliye yahan early return safe hai.)
  if (forceUpdateBlocked) {
    if (!isOnline) {
      return <InternetGate onRetry={recheckOnline} />;
    }
    return <ForceUpdateBlocker />;
  }

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-[#0d0a1a] text-white' : 'bg-[#f7f5ff] text-slate-900'} antialiased transition-colors duration-200`}>
      {/* INTERNET GATE — offline ho to sabse upar full-screen blocker (splash/modals ke upar bhi) */}
      {!isOnline && <InternetGate onRetry={recheckOnline} />}

      {/* Intro Splash Screen */}
      {showSplash && <SplashView onFinish={() => setShowSplash(false)} />}

      {/* CINEMA LIVE Background — beams, orbs, living gradient */}
      <LiveBackground />

      {/* Top Navbar */}
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenOwner={openOwnerModal}
        onOpenDownloads={openDownloads}
        onOpenBookmarks={openBookmarks}
        bookmarksCount={bookmarkedIds.length}
        downloadsCount={downloadTasks.length}
        selectedApp={!!currentSelectedApp}
        onBackToHome={closeAppDetail}
      />

      {/* Offline banner — net nahi hai to user ko pata chale */}
      {!isOnline && (
        <div className="relative z-[550] mx-auto max-w-6xl px-3 sm:px-6 pt-3">
          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>Offline ho — pehle se loaded apps dikh rahe hain, naye load nahi honge</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28">
        {currentSelectedApp ? (
          <React.Suspense fallback={<ChunkLoader />}>
          <AppDetailView
            app={currentSelectedApp}
            stats={stats[currentSelectedApp.id] || stats[getAppKey(currentSelectedApp.id)] || stats[getAppKey(currentSelectedApp.name)] || { views: 0 }}
            isBookmarked={Array.isArray(bookmarkedIds) && bookmarkedIds.includes(currentSelectedApp.id)}
            onToggleBookmark={() => handleToggleBookmark(currentSelectedApp)}
            onQuickDownload={() => handleQuickDownload(currentSelectedApp)}
            onBack={closeAppDetail}
            hasUpdate={updateAppIds.has(currentSelectedApp.id)}
            onSelectRelatedApp={(related) => openAppDetail(related)}
            allApps={safeAppsList}
            onAddReview={(rev) => addAppReview(currentSelectedApp.id || currentSelectedApp.name, rev)}
            theme={theme}
          />
          </React.Suspense>
        ) : (
          <div className="space-y-4 sm:space-y-6 stagger-list">
            {/* Note: store_status ka msg ab sirf BAND wale full-screen popup me dikhta hai
                (owner ki marzi — home par koi patli announcement strip nahi aayegi) */}

            {/* Top Official Store APK Direct Download Banner */}
            <PwaInstallBanner theme={theme} />


            {/* Search Input & Controls Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <form className="relative flex-1 search-live" onSubmit={dismissSearchKeyboard}>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  enterKeyHint="search"
                  inputMode="search"
                  placeholder={isListening ? "Listening... Speak now..." : rotatingPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchInputRef.current?.blur(); } }}
                  className={`w-full pl-10 pr-20 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-medium transition focus:outline-none ${
                    isListening
                      ? 'border-amber-500 ring-2 ring-amber-500/30 animate-pulse'
                      : 'focus:border-fuchsia-500'
                  } ${
                    theme === 'dark'
                      ? 'bg-slate-900/90 border border-slate-800 text-white placeholder:text-slate-500 shadow-inner'
                      : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm'
                  }`}
                />
                
                {/* Search Right Controls (Clear & Voice Mic) */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
                      title="Clear Search"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleVoiceSearch}
                    className={`p-1.5 sm:p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
                      isListening
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50 animate-bounce'
                        : theme === 'dark'
                        ? 'bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/50 text-amber-300 hover:text-white'
                        : 'bg-amber-100 hover:bg-amber-200 border border-amber-200 text-amber-700'
                    }`}
                    title={isListening ? "Listening... Tap to stop" : "Voice Search (Speak to Search)"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-white animate-pulse" />
                    ) : (
                      <Mic className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                </div>
              </form>

              {/* High-Visibility Eye-Catching Guide Button & Sort Selector */}
              <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
                {/* Standout How to Install Guide Button */}
                <button
                  onClick={openInstallGuide}
                  className="relative group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-600 hover:from-amber-400 hover:via-amber-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-600/30 hover:shadow-amber-500/50 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden border border-white/25 flex-1 sm:flex-none whitespace-nowrap"
                  title="How to Install Guide (Play Protect / Chrome Fix)"
                >
                  {/* Subtle Light Shimmer Sweep */}
                  <div className="absolute inset-0 w-1/3 h-full bg-white/25 skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000 ease-out pointer-events-none" />

                  {/* Pulsing Alert/Notice Dot */}
                  <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-80" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400 shadow-sm" />
                  </span>

                  <HelpCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-300 flex-shrink-0" />
                  <span>Installation Guide</span>
                  <span className="hidden xs:inline-block text-[9px] px-1.5 py-0.5 rounded bg-black/35 font-extrabold uppercase tracking-wider text-amber-200 ml-0.5">
                    Fix Errors
                  </span>
                </button>

                {/* Sort Selector Dropdown */}
                <div className={`flex items-center gap-2 px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-2xl border text-xs sm:text-sm font-semibold ${
                  theme === 'dark' ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}>
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="trending" className="bg-slate-900 text-white">Trending 🔥</option>
                    <option value="newest" className="bg-slate-900 text-white">Newest First 🆕</option>
                    <option value="downloads" className="bg-slate-900 text-white">Most Downloaded</option>
                    <option value="rating" className="bg-slate-900 text-white">Highest Rated (★)</option>
                    <option value="size" className="bg-slate-900 text-white">Smallest Size (MB)</option>
                    <option value="name" className="bg-slate-900 text-white">Alphabetical (A-Z)</option>
                  </select>
                </div>

                {/* Saved-only filter chip — sirf bookmark wale apps */}
                <button
                  onClick={() => setShowSavedOnly((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-2xl border text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer whitespace-nowrap ${
                    showSavedOnly
                      ? 'bg-gradient-to-r from-amber-500 to-fuchsia-500 border-amber-400/60 text-white shadow-lg shadow-fuchsia-500/30'
                      : theme === 'dark'
                        ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-fuchsia-400/50'
                        : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-fuchsia-300'
                  }`}
                  title="Sirf saved (bookmark) apps dikhao"
                >
                  <Bookmark className={`w-3.5 h-3.5 flex-shrink-0 ${showSavedOnly ? 'fill-white' : 'text-amber-400'}`} />
                  <span>Saved ({bookmarkedIds.length})</span>
                </button>
              </div>
            </div>

            {/* Voice Search Live Status & Audio Feedback Indicator */}
            {voiceStatus && (
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-xs text-amber-200 shadow-lg animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  <span className="font-semibold text-white">{voiceStatus}</span>
                </div>
                <button
                  onClick={() => setVoiceStatus(null)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Trending Searches */}
            {!searchQuery && trendingSearches.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap px-1 anim-fade-up">
                <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-rose-500">
                  <Flame className="w-3.5 h-3.5" /> Trending
                </span>
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-white hover:bg-fuchsia-50 border border-slate-200 hover:border-fuchsia-400 text-slate-600 hover:text-fuchsia-600 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}

            {/* Featured Slider Banner — Cinema Spotlight */}
            {!searchQuery && selectedCategory === 'All' && (
              <BannerSlider
                apps={safeAppsList}
                onSelectApp={(app) => openAppDetail(app)}
                onQuickDownload={(app) => handleQuickDownload(app)}
                theme={theme}
              />
            )}

            {/* Top 10 Charts Rail */}
            {!searchQuery && selectedCategory === 'All' && (
              <TopChartsRail ranked={rankedApps} onSelect={(app) => openAppDetail(app)} theme={theme} />
            )}

            {/* Recently Viewed */}
            {!searchQuery && selectedCategory === 'All' && (
              <RecentlyViewedRow
                apps={recentApps}
                onSelect={(app) => openAppDetail(app)}
                onClear={() => setRecentIds([])}
                theme={theme}
              />
            )}

            {/* Category Pills */}
            <CategoryPills
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              appsCountByCategory={appsCountByCategory}
              theme={theme}
            />

            {/* Apps Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-rose-500 via-fuchsia-500 to-violet-600 shadow-[0_0_14px_rgba(217,70,239,0.55)]" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-fuchsia-600 leading-none mb-1">Premium Store</p>
                    <h2 className="font-display text-base sm:text-lg font-black tracking-tight leading-none text-flow">
                      {searchQuery ? `Search Results (${filteredApps.length})` : `${selectedCategory} Collection (${filteredApps.length})`}
                    </h2>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-500/10 border border-violet-500/25 px-2.5 py-1 rounded-full whitespace-nowrap">
                  100% Tested
                </span>
              </div>

              {loading && safeAppsList.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={`rounded-[1.6rem] overflow-hidden animate-pulse border ${
                        theme === 'dark' ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className={`h-[104px] ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gradient-to-br from-violet-200 via-fuchsia-200 to-amber-200'}`} />
                      <div className="p-4 pt-9 space-y-2 flex flex-col items-center">
                        <div className={`h-4 rounded-md w-3/4 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`} />
                        <div className={`h-3 rounded-md w-1/2 ${theme === 'dark' ? 'bg-white/[0.07]' : 'bg-slate-100'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredApps.length === 0 ? (
                <div className={`py-16 text-center space-y-3 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-fuchsia-50 text-fuchsia-400'}`}>
                    <Package className="w-7 h-7" />
                  </div>
                  {showSavedOnly && bookmarkedIds.length === 0 ? (
                    <>
                      <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Kuch Save Nahi Hai</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Abhi tak koi app save nahi ki hai. Kisi bhi card par bookmark dabao — wo yahan dikhegi.
                      </p>
                      <button
                        onClick={() => setShowSavedOnly(false)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-600/30 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>Saved Filter Hatao — Sab Dikhao</span>
                      </button>
                    </>
                  ) : safeAppsList.length === 0 && !searchQuery ? (
                    <>
                      <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Store Load Nahi Hua</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Internet slow hai ya connection nahi hai. Data aate hi apps apne aap dikhne lagenge — ya abhi dobara try karo.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-600/30 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Dobara Try Karo</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>No Apps Found</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Try searching with another keyword or browse categories above.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-600/30 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>View All Apps</span>
                      </button>
                      <button
                        onClick={openRequest}
                        className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition shadow-lg shadow-fuchsia-600/30 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>Ye App Request Karo</span>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {filteredApps.map((app, idx) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      views={stats[app.id]?.views ?? stats[getAppKey(app.id)]?.views ?? stats[getAppKey(app.name)]?.views ?? app.views ?? 0}
                      downloads={downloadsOf(app)}
                      isBookmarked={bookmarkedIds.includes(app.id)}
                      onSelect={(a) => openAppDetail(a)}
                      onQuickDownload={(a) => handleQuickDownload(a)}
                      onToggleBookmark={(a) => handleToggleBookmark(a)}
                      onShare={(a) => handleShareApp(a)}
                      hasUpdate={updateAppIds.has(app.id)}
                      theme={theme}
                      index={idx}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Dock */}
      {!currentSelectedApp && (
        <BottomDock
          onHome={handleDockHome}
          onOpenBookmarks={openBookmarks}
          onOpenDownloads={openDownloads}
          onOpenOwner={openOwnerModal}
          bookmarksCount={bookmarkedIds.length}
          downloadsCount={downloadTasks.length}
        />
      )}

      {/* Share toast — card se copy hone par chhoti feedback */}
      {shareToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9500] pointer-events-none">
          <div className="px-4 py-2.5 rounded-full bg-slate-900/95 border border-white/15 text-white text-xs font-bold shadow-xl backdrop-blur whitespace-nowrap">
            {shareToast}
          </div>
        </div>
      )}

      {/* Pull-to-refresh indicator */}
      {(pullUi > 0 || ptrRefreshing) && (
        <div
          className="fixed top-3 left-1/2 z-[9500] pointer-events-none"
          style={{
            transform: `translateX(-50%) translateY(${ptrRefreshing ? 0 : Math.max(0, pullUi - 42)}px)`,
            opacity: ptrRefreshing ? 1 : Math.min(1, pullUi / 55)
          }}
        >
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 border border-white/15 text-white text-[11px] font-bold shadow-xl backdrop-blur">
            <RefreshCw
              className={`w-3.5 h-3.5 ${ptrRefreshing || pullUi > 60 ? 'animate-spin' : ''}`}
              style={
                !ptrRefreshing && pullUi <= 60
                  ? { transform: `rotate(${pullUi * 3}deg)` }
                  : undefined
              }
            />
            <span>
              {ptrRefreshing
                ? 'Refresh ho raha hai…'
                : pullUi > 60
                  ? 'Chhodo — refresh hoga'
                  : 'Neeche kheecho…'}
            </span>
          </div>
        </div>
      )}

      {/* Scroll to top — lambi list me turant upar jaane ke liye */}
      {showScrollTop && !currentSelectedApp && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-28 right-4 z-[6000] w-11 h-11 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 text-white shadow-xl shadow-fuchsia-600/40 flex items-center justify-center active:scale-90 transition cursor-pointer"
          title="Upar Jao"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Direct One-Click Fast Installer Modal */}
      <StoreUpdateModal />

      <React.Suspense fallback={null}>
      {/* WEB GATE prompt — sirf web par Download tap par khulta hai */}
      <WebApkPromptModal
        isOpen={isWebApkPromptOpen}
        onClose={() => setIsWebApkPromptOpen(false)}
        theme={theme}
      />
      <DirectInstallerModal
        app={directInstallApp}
        isOpen={!!directInstallApp}
        onClose={closeDirectInstaller}
        onDownloadStarted={handleDownloadStarted}
        onDownloadProgress={handleDownloadProgress}
        onDownloadCompleted={handleDownloadCompleted}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={closeBookmarks}
        bookmarkedApps={bookmarkedApps}
        onSelectApp={(app) => {
          closeBookmarks();
          openAppDetail(app);
        }}
        onRemoveBookmark={(app) => handleToggleBookmark(app)}
        onClearAll={() => setBookmarkedIds([])}
        theme={theme}
      />

      {/* Download History Manager Drawer */}
      <DownloadManagerDrawer
        isOpen={isDownloadsOpen}
        onClose={closeDownloads}
        tasks={downloadTasks}
        onClearHistory={() => setDownloadTasks([])}
        onInstallAgain={(task) => {
          const matchingApp = apps.find((a) => a.id === task.appId);
          if (matchingApp) {
            openDirectInstaller(matchingApp);
          } else if (decideDownloadGate() !== 'native') {
            // WEB GATE: purana task (localStorage) bhi web par browser
            // download na khole — APK-install prompt dikhao.
            setIsWebApkPromptOpen(true);
          } else {
            window.open(task.downloadUrl, '_blank');
          }
        }}
        onRemoveTask={(_task, index) => {
          setDownloadTasks((prev) => prev.filter((_, i) => i !== index));
        }}
        theme={theme}
      />

      {/* Install Guide Modal (Visual Screenshots) */}
      <InstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={closeInstallGuide}
        theme={theme}
      />

      {/* Creator Profile / Telegram Modal */}
      <OwnerModal
        isOpen={isOwnerModalOpen}
        onClose={closeOwnerModal}
        theme={theme}
      />

      {/* Admin Panel — apps add/edit/delete, PIN se khulta hai */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={closeAdmin}
        apps={safeAppsList}
        releaseIds={releaseApps.map((a) => a.id)}
        hiddenApps={releaseApps.filter((a) => hiddenLinks.includes(a.link))}
        onHideRelease={(app) =>
          setHiddenLinks((prev) => (prev.includes(app.link) ? prev : [...prev, app.link]))
        }
        onUnhideRelease={(app) => setHiddenLinks((prev) => prev.filter((l) => l !== app.link))}
        theme={theme}
      />

      {/* App Request Modal — users ki requests Admin Hub me jati hain */}
      {isRequestOpen && <RequestAppModal isOpen={isRequestOpen} onClose={closeRequest} theme={theme} />}
      </React.Suspense>
    </div>
  );
}
