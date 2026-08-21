/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  WifiOff,
  Flame,
  X,
  Smartphone,
  Info,
  CheckCircle2
} from 'lucide-react';

import { AppItem, AppStats, StoreStatus, DownloadTask } from './types';
import { INITIAL_APPS, APP_CATEGORIES } from './data/mockApps';
import { subscribeToApps, incrementAppView } from './services/firebase';

import { Navbar } from './components/Navbar';
import { SplashView } from './components/SplashView';
import { KillSwitchScreen } from './components/KillSwitchScreen';
import { BannerSlider } from './components/BannerSlider';
import { CategoryPills } from './components/CategoryPills';
import { AppCard } from './components/AppCard';
import { AppDetailView } from './components/AppDetailView';
import { DirectInstallerModal } from './components/DirectInstallerModal';
import { DownloadManagerDrawer } from './components/DownloadManagerDrawer';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { OwnerModal } from './components/OwnerModal';
import { HeartGlowOverlay } from './components/HeartGlowOverlay';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
  const [stats, setStats] = useState<Record<string, AppStats>>({});
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({
    active: true,
    msg: "Welcome to Premium Store",
    link: "#"
  });

  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'size' | 'name'>('popular');

  // Modals & Drawers
  const [isSplash, setIsSplash] = useState(true);
  const [directInstallApp, setDirectInstallApp] = useState<AppItem | null>(null);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);

  // Persistence: Bookmarks & Downloads
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('premium_store_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('premium_store_downloads') || '[]');
    } catch {
      return [];
    }
  });

  const [activeUsers, setActiveUsers] = useState(14);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Save Bookmarks & Downloads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('premium_store_bookmarks', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.warn("Storage write error", e);
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('premium_store_downloads', JSON.stringify(downloadTasks));
    } catch (e) {
      console.warn("Storage write error", e);
    }
  }, [downloadTasks]);

  // Subscribe to Firebase Live RTDB
  useEffect(() => {
    const unsub = subscribeToApps(
      (newApps) => {
        if (newApps && newApps.length > 0) {
          setApps(newApps);
        }
      },
      (newStats) => setStats(newStats),
      (newStatus) => setStoreStatus(newStatus)
    );

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Dynamic Live Users counter simulation
    const timer = setInterval(() => {
      setActiveUsers((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(8, prev + delta);
      });
    }, 4500);

    // Splash timeout
    const splashTimer = setTimeout(() => {
      setIsSplash(false);
    }, 2400);

    // Push history state to handle hardware/browser back button nicely
    window.history.pushState({ page: 'home' }, '');
    const handlePopState = () => {
      if (directInstallApp) {
        setDirectInstallApp(null);
        window.history.pushState({ page: 'home' }, '');
      } else if (isDownloadsOpen || isBookmarksOpen || isOwnerOpen) {
        setIsDownloadsOpen(false);
        setIsBookmarksOpen(false);
        setIsOwnerOpen(false);
        window.history.pushState({ page: 'home' }, '');
      } else if (selectedApp) {
        setSelectedApp(null);
        window.history.pushState({ page: 'home' }, '');
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
      clearTimeout(splashTimer);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedApp, directInstallApp, isDownloadsOpen, isBookmarksOpen, isOwnerOpen]);

  // Apply theme to document body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-white antialiased';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-100 text-slate-900 antialiased';
    }
  }, [theme]);

  // Helpers
  const getViews = (name: string) => {
    if (!name) return 0;
    const key = name.replace(/\s+/g, '-').toLowerCase();
    return stats[key]?.views || 0;
  };

  const toggleBookmark = (app: AppItem) => {
    const id = app.id || app.name;
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectApp = (app: AppItem) => {
    setSelectedApp(app);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    incrementAppView(app.name);
  };

  const handleDirectInstall = (app: AppItem) => {
    setDirectInstallApp(app);
  };

  const handleDownloadTaskStarted = (task: DownloadTask) => {
    setDownloadTasks((prev) => {
      const filtered = prev.filter((t) => t.appName !== task.appName);
      return [task, ...filtered];
    });
  };

  // Category counts
  const appsCountByCategory = useMemo(() => {
    const counts: Record<string, number> = { All: apps.length };
    apps.forEach((a) => {
      counts[a.cat] = (counts[a.cat] || 0) + 1;
    });
    return counts;
  }, [apps]);

  // Filtered & Sorted Apps
  const filteredApps = useMemo(() => {
    return apps
      .filter((app) => {
        const matchesCategory = selectedCategory === 'All' || app.cat.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch =
          !searchQuery.trim() ||
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.cat.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (getViews(b.name) || (b.downloads || 0)) - (getViews(a.name) || (a.downloads || 0));
        }
        if (sortBy === 'rating') {
          return (b.rating || 4.5) - (a.rating || 4.5);
        }
        if (sortBy === 'size') {
          const mbA = typeof a.mb === 'string' ? parseFloat(a.mb) || 0 : a.mb;
          const mbB = typeof b.mb === 'string' ? parseFloat(b.mb) || 0 : b.mb;
          return mbB - mbA;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [apps, selectedCategory, searchQuery, sortBy, stats]);

  const bookmarkedAppsList = useMemo(() => {
    return apps.filter((a) => bookmarkedIds.includes(a.id || a.name));
  }, [apps, bookmarkedIds]);

  // Kill switch view if store inactive
  if (!storeStatus.active) {
    return <KillSwitchScreen status={storeStatus} />;
  }

  // Offline view
  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[10000] bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 rounded-full bg-slate-900 border border-slate-800 mb-6">
          <WifiOff className="w-16 h-16 text-slate-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black mb-2">No Internet Connection</h2>
        <p className="text-xs text-slate-400 max-w-xs uppercase tracking-widest font-bold">
          Please reconnect to the internet to download packages and access live store data.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Interactive Rainbow Floating Heart Glow Effect on Click/Tap */}
      <HeartGlowOverlay enabled={true} />

      {/* Splash Screen */}
      <AnimatePresence>
        {isSplash && <SplashView onFinish={() => setIsSplash(false)} />}
      </AnimatePresence>

      {/* Navigation Bar */}
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        activeUsers={activeUsers}
        onOpenOwner={() => setIsOwnerOpen(true)}
        onOpenDownloads={() => setIsDownloadsOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarksCount={bookmarkedIds.length}
        downloadsCount={downloadTasks.length}
        selectedApp={Boolean(selectedApp)}
        onBackToHome={() => setSelectedApp(null)}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {selectedApp ? (
          /* Detailed App View */
          <AppDetailView
            app={selectedApp}
            stats={stats[selectedApp.name.replace(/\s+/g, '-').toLowerCase()]}
            isBookmarked={bookmarkedIds.includes(selectedApp.id || selectedApp.name)}
            onToggleBookmark={toggleBookmark}
            onDirectInstall={handleDirectInstall}
            onBack={() => setSelectedApp(null)}
            onSelectRelatedApp={handleSelectApp}
            allApps={apps}
            theme={theme}
          />
        ) : (
          /* Store Front Dashboard */
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div
                className={`flex-1 relative flex items-center rounded-2xl border transition-all shadow-sm ${
                  theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800 focus-within:border-purple-500'
                    : 'bg-white border-slate-200 focus-within:border-purple-500'
                }`}
              >
                <Search className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search VIP APKs, Mods, Tools, Games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent p-3.5 pl-3 text-sm focus:outline-none placeholder:text-slate-500 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-2 mr-2 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${
                  theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <ArrowUpDown className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
                >
                  <option value="popular" className="bg-slate-900 text-white">Most Popular</option>
                  <option value="rating" className="bg-slate-900 text-white">Highest Rated</option>
                  <option value="size" className="bg-slate-900 text-white">File Size</option>
                  <option value="name" className="bg-slate-900 text-white">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Featured Hero Banner */}
            {!searchQuery && selectedCategory === 'All' && (
              <BannerSlider
                apps={apps}
                onSelectApp={handleSelectApp}
                onQuickDownload={handleDirectInstall}
                theme={theme}
              />
            )}

            {/* Category Selector Pills */}
            <CategoryPills
              categories={APP_CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              appsCountByCategory={appsCountByCategory}
              theme={theme}
            />

            {/* Section Header */}
            <div className="flex items-center justify-between pt-2 px-1">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {selectedCategory === 'All' ? 'Trending & Verified Applications' : `${selectedCategory} Applications`} ({filteredApps.length})
                </h2>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Virus Free
              </span>
            </div>

            {/* Apps Grid */}
            {filteredApps.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <p className="text-base font-bold text-slate-400">No Applications Found</p>
                <p className="text-xs max-w-xs mx-auto">
                  Try searching for another keyword or change your category filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 px-4 py-2 bg-purple-600/20 text-purple-400 text-xs font-bold rounded-xl border border-purple-500/30"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredApps.map((app, index) => (
                  <AppCard
                    key={app.id || app.name}
                    app={app}
                    views={getViews(app.name)}
                    isBookmarked={bookmarkedIds.includes(app.id || app.name)}
                    onSelect={handleSelectApp}
                    onQuickDownload={handleDirectInstall}
                    onToggleBookmark={toggleBookmark}
                    theme={theme}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Direct In-App Package Download & Installer Modal */}
      <DirectInstallerModal
        app={directInstallApp}
        isOpen={Boolean(directInstallApp)}
        onClose={() => setDirectInstallApp(null)}
        onDownloadStarted={handleDownloadTaskStarted}
      />

      {/* Downloads Manager Drawer */}
      <DownloadManagerDrawer
        isOpen={isDownloadsOpen}
        onClose={() => setIsDownloadsOpen(false)}
        tasks={downloadTasks}
        onClearHistory={() => setDownloadTasks([])}
        onInstallAgain={(task) => {
          const matchedApp = apps.find((a) => a.name === task.appName) || {
            id: task.appId,
            name: task.appName,
            cat: 'Tools',
            ver: task.version,
            mb: task.sizeMb,
            icon: task.appIcon,
            link: task.downloadUrl,
            desc: 'Application ready for direct installation.'
          };
          setIsDownloadsOpen(false);
          setDirectInstallApp(matchedApp);
        }}
        theme={theme}
      />

      {/* Saved Favorites Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedApps={bookmarkedAppsList}
        onSelectApp={handleSelectApp}
        onRemoveBookmark={toggleBookmark}
        onClearAll={() => setBookmarkedIds([])}
        theme={theme}
      />

      {/* Owner & Channel Profile Sheet */}
      <OwnerModal
        isOpen={isOwnerOpen}
        onClose={() => setIsOwnerOpen(false)}
        theme={theme}
      />
    </div>
  );
}
