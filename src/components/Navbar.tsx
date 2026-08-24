import React from 'react';
import {
  Sparkles,
  Download,
  Bookmark,
  Sun,
  Moon,
  ShieldCheck,
  Smartphone,
  HelpCircle,
  MessageSquare,
  Instagram
} from 'lucide-react';
import { STORE_CONFIG } from '../config';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenOwner: () => void;
  onOpenDownloads: () => void;
  onOpenBookmarks: () => void;
  onOpenInstallGuide: () => void;
  onOpenRequestApp: () => void;
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
  onOpenInstallGuide,
  onOpenRequestApp,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Title (Always Clean & Navigates to Home) */}
        <div
          onClick={onBackToHome}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          {/* Store Brand: Elegant Vector Store Icon */}
          <div className="relative w-10 h-10 rounded-2xl p-0.5 bg-gradient-to-tr from-purple-600 via-pink-600 to-blue-600 shadow-md shadow-purple-600/25 flex items-center justify-center group-hover:scale-105 transition duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          {/* Store Title & Verified Badge */}
          <div className="flex flex-col justify-center">
            <h1 className="text-lg sm:text-xl font-black italic tracking-tight rainbow-text leading-none group-hover:opacity-90 transition">
              {STORE_CONFIG.STORE_NAME}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> VIP Store
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* How to Install Guide Button */}
          <button
            onClick={onOpenInstallGuide}
            className={`hidden md:flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-bold transition ${
              theme === 'dark'
                ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title="How to install APKs on Android"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Install Guide</span>
          </button>

          {/* Request App Button */}
          <button
            onClick={onOpenRequestApp}
            className={`hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-bold transition ${
              theme === 'dark'
                ? 'bg-purple-950/40 border-purple-800/50 hover:bg-purple-900/50 text-purple-300'
                : 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700'
            }`}
            title="Request a new VIP APK or Mod"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>Request App</span>
          </button>

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

          {/* Owner Avatar / Instagram Profile */}
          <button
            onClick={onOpenOwner}
            className="relative p-0.5 rounded-full ring-2 ring-pink-500/80 hover:ring-pink-400 transition ml-0.5 cursor-pointer"
            title="Official Creator Instagram & Info"
          >
            <img
              src={ownerImg}
              alt={STORE_CONFIG.OWNER_NAME}
              className="w-8 h-8 rounded-full object-cover shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";
              }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 border-2 border-slate-950 rounded-full flex items-center justify-center">
              <Instagram className="w-2 h-2 text-white" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
