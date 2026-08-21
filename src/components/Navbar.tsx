import React from 'react';
import {
  Sparkles,
  Download,
  Bookmark,
  Sun,
  Moon,
  Search,
  Users,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeUsers: number;
  onOpenOwner: () => void;
  onOpenDownloads: () => void;
  onOpenBookmarks: () => void;
  bookmarksCount: number;
  downloadsCount: number;
  selectedApp: boolean;
  onBackToHome: () => void;
  ownerImg?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  activeUsers,
  onOpenOwner,
  onOpenDownloads,
  onOpenBookmarks,
  bookmarksCount,
  downloadsCount,
  selectedApp,
  onBackToHome,
  ownerImg = "https://i.ibb.co/HffVtwhY/image.jpg"
}) => {
  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-slate-950/80 border-slate-800/80 text-white'
          : 'bg-white/85 border-slate-200/80 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo / Back Button */}
        <div
          onClick={onBackToHome}
          className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          {selectedApp ? (
            <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 transition">
              <span className="text-sm font-bold">← Back to Store</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-blue-600 p-0.5 shadow-md shadow-purple-600/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-black italic tracking-tight rainbow-text leading-none">
                  PREMIUM STORE
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                    {activeUsers} Active Live
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Bookmarks / Saved Button */}
          <button
            onClick={onOpenBookmarks}
            className={`relative p-2.5 rounded-xl border transition ${
              theme === 'dark'
                ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title="Saved Favorites"
            aria-label="Saved Favorites"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarksCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* Downloads Manager Button */}
          <button
            onClick={onOpenDownloads}
            className={`relative p-2.5 rounded-xl border transition ${
              theme === 'dark'
                ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title="Downloads & Installer"
            aria-label="Downloads"
          >
            <Download className="w-4 h-4" />
            {downloadsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow">
                {downloadsCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl border transition ${
              theme === 'dark'
                ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-yellow-400'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            aria-label="Theme toggle"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Owner Avatar / Channel Profile */}
          <button
            onClick={onOpenOwner}
            className="relative p-0.5 rounded-full ring-2 ring-purple-600/80 hover:ring-purple-400 transition ml-1"
            title="Official Creator Channel"
          >
            <img
              src={ownerImg}
              alt="Channel Owner"
              className="w-8 h-8 rounded-full object-cover shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";
              }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 border-2 border-slate-950 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-2 h-2 text-white" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
