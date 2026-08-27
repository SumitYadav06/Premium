import React from 'react';
import {
  Download,
  Bookmark,
  Sun,
  Moon,
  ShieldCheck,
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
        {/* Left: Brand Logo & Title */}
        <div
          onClick={onBackToHome}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          {/* Store Brand: 7-Color Live Continuous Flowing Rainbow Android Mascot Icon */}
          <div className="relative w-11 h-11 rounded-2xl p-0.5 rainbow-bg shadow-lg shadow-pink-500/25 flex items-center justify-center group-hover:scale-105 transition duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-0.5 overflow-hidden">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Antennas */}
                <line x1="7.2" y1="7.2" x2="4.8" y2="3.2" stroke="url(#chroma-live-flow)" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="16.8" y1="7.2" x2="19.2" y2="3.2" stroke="url(#chroma-live-flow)" strokeWidth="2.2" strokeLinecap="round" />
                
                {/* Mascot Dome */}
                <path d="M4 17.5 C4 9.5 7.5 6.5 12 6.5 C16.5 6.5 20 9.5 20 17.5 Z" fill="url(#chroma-live-flow)" />
                
                {/* Eyes */}
                <circle cx="8.5" cy="11.8" r="1.2" fill="#020617" />
                <circle cx="15.5" cy="11.8" r="1.2" fill="#020617" />

                {/* Animated Rainbow Gradient Definition */}
                <defs>
                  <linearGradient id="chroma-live-flow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff2d55">
                      <animate attributeName="stop-color" values="#ff2d55;#ff9500;#ffcc00;#34c759;#00c7be;#32ade6;#5856d6;#af52de;#ff2d55" dur="4s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="30%" stopColor="#ff9500">
                      <animate attributeName="stop-color" values="#ff9500;#ffcc00;#34c759;#00c7be;#32ade6;#5856d6;#af52de;#ff2d55;#ff9500" dur="4s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="60%" stopColor="#34c759">
                      <animate attributeName="stop-color" values="#34c759;#00c7be;#32ade6;#5856d6;#af52de;#ff2d55;#ff9500;#ffcc00;#34c759" dur="4s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="100%" stopColor="#32ade6">
                      <animate attributeName="stop-color" values="#32ade6;#5856d6;#af52de;#ff2d55;#ff9500;#ffcc00;#34c759;#00c7be;#32ade6" dur="4s" repeatCount="indefinite" />
                    </stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Store Title & Verified Badge */}
          <div className="flex flex-col justify-center">
            <h1 className="text-lg sm:text-xl font-black italic tracking-tight rainbow-text leading-none group-hover:opacity-90 transition">
              {STORE_CONFIG.STORE_NAME}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> VIP Store
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Request App Button */}
          <button
            onClick={onOpenRequestApp}
            className={`hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
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
            className={`relative p-2.5 rounded-xl border transition cursor-pointer ${
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
            className={`relative p-2.5 rounded-xl border transition cursor-pointer ${
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
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-amber-400'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Creator Profile Avatar Button */}
          <button
            onClick={onOpenOwner}
            className="relative p-0.5 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 hover:scale-105 transition-transform duration-200 focus:outline-none flex-shrink-0 cursor-pointer shadow-md shadow-purple-500/20"
            title={`Creator: ${STORE_CONFIG.OWNER_NAME}`}
          >
            <img
              src={ownerImg}
              alt={STORE_CONFIG.OWNER_NAME}
              className="w-8 h-8 rounded-full object-cover shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://i.ibb.co/HffVtwhY/image.jpg";
              }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-tr from-purple-600 to-pink-600 border-2 border-slate-950 rounded-full flex items-center justify-center shadow-sm">
              <Instagram className="w-2 h-2 text-white" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
