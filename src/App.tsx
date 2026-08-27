import React, { useState, useEffect, useMemo } from 'react';
import { AppItem, AppStats, StoreStatus, DownloadTask } from './types';
import { INITIAL_APPS } from './data/mockApps';
import {
  subscribeToApps,
  addAppReview,
  incrementAppDownload,
  incrementAppView
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
import { RequestAppModal } from './components/RequestAppModal';
import { OwnerModal } from './components/OwnerModal';
import { SplashView } from './components/SplashView';
import { KillSwitchScreen } from './components/KillSwitchScreen';
import {
  Search,
  ArrowUpDown,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Send,
  HelpCircle,
  Package
} from 'lucide-react';

export default function App() {
  // Store Data & Realtime State
  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
  const [stats, setStats] = useState<Record<string, AppStats>>({});
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({
    active: true,
    msg: '',
    link: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // UI Filters
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'trending' | 'downloads' | 'rating' | 'size' | 'name'>('trending');

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
  const [isRequestAppOpen, setIsRequestAppOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

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

  // Safe Apps Array Fallback
  const safeAppsList = useMemo(() => {
    return Array.isArray(apps) && apps.length > 0 ? apps : INITIAL_APPS;
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

  if (!storeStatus.active) {
    return <KillSwitchScreen />;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#030712] text-white' : 'bg-slate-50 text-slate-900'} antialiased transition-colors duration-200`}>
      {/* Intro Splash Screen */}
      {showSplash && <SplashView onFinish={() => setShowSplash(false)} />}

      {/* Top Navbar */}
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenOwner={() => setIsOwnerModalOpen(true)}
        onOpenDownloads={() => setIsDownloadsOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
        onOpenRequestApp={() => setIsRequestAppOpen(true)}
        bookmarksCount={bookmarkedIds.length}
        downloadsCount={downloadTasks.length}
        selectedApp={!!selectedApp}
        onBackToHome={() => setSelectedApp(null)}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {selectedApp ? (
          <AppDetailView
            app={selectedApp}
            stats={stats[selectedApp.id] || { views: 0 }}
            isBookmarked={Array.isArray(bookmarkedIds) && bookmarkedIds.includes(selectedApp.id)}
            onToggleBookmark={() => handleToggleBookmark(selectedApp)}
            onQuickDownload={() => handleQuickDownload(selectedApp)}
            onBack={() => setSelectedApp(null)}
            onSelectRelatedApp={(related) => {
              setSelectedApp(related);
              incrementAppView(related.id);
            }}
            allApps={safeAppsList}
            onAddReview={(rev) => addAppReview(selectedApp.name, rev)}
            theme={theme}
          />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Search Input & Sort Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  placeholder="Search VIP Mods, games, premium tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-medium transition focus:outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-900/90 border border-slate-800 focus:border-purple-500 text-white placeholder:text-slate-500 shadow-inner'
                      : 'bg-white border border-slate-200 focus:border-purple-500 text-slate-900 placeholder:text-slate-400 shadow-sm'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Sorting Filter */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-xs font-semibold ${
                  theme === 'dark' ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}>
                  <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
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

            {/* Featured Slider Banner */}
            {!searchQuery && selectedCategory === 'All' && (
              <BannerSlider
                apps={safeAppsList}
                onSelectApp={(app) => {
                  incrementAppView(app.id);
                  setSelectedApp(app);
                }}
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

              {filteredApps.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Apps Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try searching with another keyword or request this app directly!
                  </p>
                  <button
                    onClick={() => setIsRequestAppOpen(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Request this App</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                  {filteredApps.map((app, idx) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      views={stats[app.id]?.views || 0}
                      isBookmarked={bookmarkedIds.includes(app.id)}
                      onSelect={(a) => {
                        incrementAppView(a.id);
                        setSelectedApp(a);
                      }}
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
        onClose={() => setDirectInstallApp(null)}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedApps={bookmarkedApps}
        onSelectApp={(app) => {
          setSelectedApp(app);
          setIsBookmarksOpen(false);
        }}
        onRemoveBookmark={(app) => handleToggleBookmark(app)}
        onClearAll={() => setBookmarkedIds([])}
        theme={theme}
      />

      {/* Download History Manager Drawer */}
      <DownloadManagerDrawer
        isOpen={isDownloadsOpen}
        onClose={() => setIsDownloadsOpen(false)}
        tasks={downloadTasks}
        onClearHistory={() => setDownloadTasks([])}
        onInstallAgain={(task) => {
          const matchingApp = apps.find((a) => a.id === task.appId);
          if (matchingApp) {
            setDirectInstallApp(matchingApp);
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
        onClose={() => setIsInstallGuideOpen(false)}
        theme={theme}
      />

      {/* Super Compact & Fast Request App Modal */}
      <RequestAppModal
        isOpen={isRequestAppOpen}
        onClose={() => setIsRequestAppOpen(false)}
        theme={theme}
      />

      {/* Creator Profile / Instagram Modal */}
      <OwnerModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        theme={theme}
      />
    </div>
  );
}
