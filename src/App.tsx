import React, { useState, useEffect, useMemo } from 'react';
import { AppItem, AppStats, StoreStatus, DownloadTask } from './types';
import { INITIAL_APPS } from './data/mockApps';
import {
  subscribeToApps,
  addAppReview,
  incrementAppDownload,
  incrementAppView,
  getAppKey
} from './services/firebase';
import { STORE_CONFIG } from './config';
import { Navbar } from './components/Navbar';
import { BannerSlider } from './components/BannerSlider';
import { CategoryPills } from './components/CategoryPills';
import { AppCard } from './components/AppCard';
import { AppDetailView } from './components/AppDetailView';
import { DirectInstallerModal } from './components/DirectInstallerModal';
import { DownloadManagerDrawer } from './components/DownloadManagerDrawer';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { InstallGuideModal } from './components/InstallGuideModal';
import { OwnerModal } from './components/OwnerModal';
import { SplashView } from './components/SplashView';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import {
  Search,
  ArrowUpDown,
  HelpCircle,
  Package,
  Mic,
  MicOff,
  X as XIcon
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
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({
    active: true,
    msg: '',
    link: ''
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('premium_store_cached_apps');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const [showSplash, setShowSplash] = useState(true);

  // UI Filters
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'trending' | 'downloads' | 'rating' | 'size' | 'name'>('trending');

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

  // Auto-dismiss Splash screen failsafe timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Navigation & Modals
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [directInstallApp, setDirectInstallApp] = useState<AppItem | null>(null);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

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

  // View Openers & Closers with Automatic Browser / Android History Pushes
  const openAppDetail = (app: AppItem) => {
    incrementAppView(app.id || app.name);
    setSelectedApp(app);
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

  const openDirectInstaller = (app: AppItem) => {
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

  // Android Hardware / Gesture Navigation popstate listener
  useEffect(() => {
    // Ensure root entry has home state
    if (!window.history.state) {
      try {
        window.history.replaceState({ view: 'home' }, '');
      } catch (e) {}
    }

    const handlePopState = () => {
      // Step-by-step priority back navigation for Android back button
      if (isInstallGuideOpenRef.current) {
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
        setSelectedApp(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
      },
      (loadedStatus) => {
        setStoreStatus(loadedStatus);
      }
    );

    return () => unsub();
  }, []);

  // Save Bookmarks
  useEffect(() => {
    localStorage.setItem('premium_store_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Save Tasks
  useEffect(() => {
    localStorage.setItem('premium_store_download_tasks', JSON.stringify(downloadTasks));
  }, [downloadTasks]);

  // Safe Apps Array Fallback (Never show fake dummy apps)
  const safeAppsList = useMemo(() => {
    return Array.isArray(apps) ? apps : [];
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

  // Start Download / Direct Installer
  const handleQuickDownload = (app: AppItem) => {
    incrementAppDownload(app.id);
    const newTask: DownloadTask = {
      appId: app.id,
      appName: app.name,
      appIcon: app.icon,
      version: app.ver,
      sizeMb: app.mb,
      progress: 100,
      status: 'ready',
      downloadUrl: app.link,
      startedAt: Date.now(),
      completedAt: Date.now()
    };
    setDownloadTasks((prev) => [newTask, ...(Array.isArray(prev) ? prev.filter((t) => t.appId !== app.id) : [])]);
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
  }, [safeAppsList, selectedCategory, searchQuery, sortBy, stats]);

  const bookmarkedApps = useMemo(() => {
    return safeAppsList.filter((a) => a && Array.isArray(bookmarkedIds) && bookmarkedIds.includes(a.id));
  }, [safeAppsList, bookmarkedIds]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#030712] text-white' : 'bg-slate-50 text-slate-900'} antialiased transition-colors duration-200`}>
      {/* Intro Splash Screen */}
      {showSplash && <SplashView onFinish={() => setShowSplash(false)} />}

      {/* Top Navbar */}
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenOwner={openOwnerModal}
        onOpenDownloads={openDownloads}
        onOpenBookmarks={openBookmarks}
        bookmarksCount={bookmarkedIds.length}
        downloadsCount={downloadTasks.length}
        selectedApp={!!selectedApp}
        onBackToHome={closeAppDetail}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {selectedApp ? (
          <AppDetailView
            app={selectedApp}
            stats={stats[selectedApp.id] || stats[getAppKey(selectedApp.id)] || stats[getAppKey(selectedApp.name)] || { views: 0 }}
            isBookmarked={Array.isArray(bookmarkedIds) && bookmarkedIds.includes(selectedApp.id)}
            onToggleBookmark={() => handleToggleBookmark(selectedApp)}
            onQuickDownload={() => handleQuickDownload(selectedApp)}
            onBack={closeAppDetail}
            onSelectRelatedApp={(related) => openAppDetail(related)}
            allApps={safeAppsList}
            onAddReview={(rev) => addAppReview(selectedApp.id || selectedApp.name, rev)}
            theme={theme}
          />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Top Official Store APK Direct Download Banner */}
            <PwaInstallBanner theme={theme} />

            {/* Search Input & Controls Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  placeholder={isListening ? "Listening... Speak now..." : "Search VIP Mods, games, premium tools..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-20 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-medium transition focus:outline-none ${
                    isListening
                      ? 'border-rose-500 ring-2 ring-rose-500/30 animate-pulse'
                      : 'focus:border-purple-500'
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
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50 animate-bounce'
                        : theme === 'dark'
                        ? 'bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/50 text-purple-300 hover:text-white'
                        : 'bg-purple-100 hover:bg-purple-200 border border-purple-200 text-purple-700'
                    }`}
                    title={isListening ? "Listening... Tap to stop" : "Voice Search (Speak to Search)"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-white animate-pulse" />
                    ) : (
                      <Mic className="w-4 h-4 text-purple-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* High-Visibility Eye-Catching Guide Button & Sort Selector */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Standout How to Install Guide Button */}
                <button
                  onClick={openInstallGuide}
                  className="relative group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-400 hover:via-rose-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-pink-600/30 hover:shadow-pink-500/50 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden border border-white/25 flex-1 sm:flex-none whitespace-nowrap"
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
                  <ArrowUpDown className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="trending" className="bg-slate-900 text-white">Trending 🔥</option>
                    <option value="downloads" className="bg-slate-900 text-white">Most Downloaded</option>
                    <option value="rating" className="bg-slate-900 text-white">Highest Rated (★)</option>
                    <option value="size" className="bg-slate-900 text-white">Smallest Size (MB)</option>
                    <option value="name" className="bg-slate-900 text-white">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Voice Search Live Status & Audio Feedback Indicator */}
            {voiceStatus && (
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-purple-950/80 border border-purple-500/50 text-xs text-purple-200 shadow-lg animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
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

            {/* Featured Slider Banner */}
            {!searchQuery && selectedCategory === 'All' && (
              <BannerSlider
                apps={safeAppsList}
                onSelectApp={(app) => openAppDetail(app)}
                onQuickDownload={(app) => handleQuickDownload(app)}
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
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                  <h2 className="text-sm sm:text-base font-black tracking-tight font-mono text-white">
                    {searchQuery ? `Search Results (${filteredApps.length})` : `${selectedCategory} Collection (${filteredApps.length})`}
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  100% Tested VIP APKs
                </span>
              </div>

              {loading && safeAppsList.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center gap-3.5"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-800 rounded-md w-3/4" />
                        <div className="h-3 bg-slate-800/60 rounded-md w-1/2" />
                        <div className="h-3 bg-slate-800/40 rounded-md w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Apps Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try searching with another keyword or browse categories above.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>View All Apps</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                  {filteredApps.map((app, idx) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      views={stats[app.id]?.views ?? stats[getAppKey(app.id)]?.views ?? stats[getAppKey(app.name)]?.views ?? app.views ?? 0}
                      isBookmarked={bookmarkedIds.includes(app.id)}
                      onSelect={(a) => openAppDetail(a)}
                      onQuickDownload={(a) => handleQuickDownload(a)}
                      onToggleBookmark={(a) => handleToggleBookmark(a)}
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

      {/* Direct One-Click Fast Installer Modal */}
      <DirectInstallerModal
        app={directInstallApp}
        isOpen={!!directInstallApp}
        onClose={closeDirectInstaller}
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

      {/* Creator Profile / Instagram Modal */}
      <OwnerModal
        isOpen={isOwnerModalOpen}
        onClose={closeOwnerModal}
        theme={theme}
      />
    </div>
  );
}
