import React from 'react';
import {
  Download,
  Bookmark,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { STORE_CONFIG } from '../config';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenOwner: () => void;
  onOpenDownloads: () => void;
  onOpenBookmarks: () => void;
  onOpenInstallGuide?: () => void;
  onOpenRequestApp?: () => void;
  onOpenStoreApk?: () => void;
  bookmarksCount: number;
  downloadsCount: number;
  selectedApp: boolean;
  onBackToHome: () => void;
  ownerImg?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenOwner,
  onOpenDownloads,
  onOpenBookmarks,
  bookmarksCount,
  downloadsCount,
  selectedApp,
  onBackToHome,
  ownerImg = STORE_CONFIG.OWNER_IMAGE
}) => {
  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-slate-950/85 border-slate-800/80 text-white'
          : 'bg-white/90 border-slate-200/80 text-slate-900 shadow-sm'
      }`}
    >
      <div className="absolute bottom-0 inset-x-0 h-[2.5px] rainbow-bg opacity-80" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Title */}
        <div
          onClick={onBackToHome}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          {/* Store Brand: Official App Icon */}
          <div className="anim-float relative w-11 h-11 rounded-2xl p-0.5 ring-conic shadow-lg shadow-fuchsia-500/30 flex items-center justify-center group-hover:scale-105 transition duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-0.5 overflow-hidden">
              <img
                src={STORE_CONFIG.STORE_APP_ICON}
                alt={STORE_CONFIG.STORE_NAME}
                className="w-full h-full object-cover rounded-[12px]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('raw.githubusercontent.com')) {
                    target.src = "https://raw.githubusercontent.com/SumitYadav06/Premium/main/app-icon.png";
                  }
                }}
              />
            </div>
          </div>

          {/* Store Title & Verified Badge */}
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-[19px] sm:text-[22px] font-black tracking-tight brand-text leading-[1.3] group-hover:scale-[1.03] origin-left transition-transform duration-300">
              {STORE_CONFIG.STORE_NAME}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified Store
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Bookmarks / Saved Button */}
          <button
            onClick={onOpenBookmarks}
            className={`relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title="Saved Favorites"
            aria-label="Saved Favorites"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarksCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* Downloads Manager Button */}
          <button
            onClick={onOpenDownloads}
            className={`relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title="Downloads & Installer"
            aria-label="Downloads"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            {downloadsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-extrabold flex items-center justify-center shadow animate-pulse">
                {downloadsCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-amber-400'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>
      </div>
    </header>
  );
};
