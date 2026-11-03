import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Sun,
  Moon,
  Sparkles,
  History,
  Bookmark,
  Download,
  Trash2,
  Send,
  Info,
  ChevronRight
} from 'lucide-react';
import { STORE_CONFIG } from '../config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  animationsOn: boolean;
  onToggleAnimations: () => void;
  recentCount: number;
  bookmarksCount: number;
  downloadsCount: number;
  onClearRecent: () => void;
  onClearBookmarks: () => void;
  onClearDownloads: () => void;
}

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: [0.2, 0.8, 0.2, 1] as const }
});

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  animationsOn,
  onToggleAnimations,
  recentCount,
  bookmarksCount,
  downloadsCount,
  onClearRecent,
  onClearBookmarks,
  onClearDownloads
}) => {
  if (!isOpen) return null;

  const dark = theme === 'dark';
  const card = dark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200';
  const rowText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText = 'text-slate-400';

  const handleOpenTelegram = () => {
    const username = STORE_CONFIG.OWNER_TELEGRAM_USERNAME || 'apna_jugaad';
    const fallbackUrl = STORE_CONFIG.OWNER_TELEGRAM || `https://t.me/${username}`;
    const timer = window.setTimeout(() => {
      if (!document.hidden) window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    }, 1200);
    const onVis = () => {
      if (document.hidden) {
        window.clearTimeout(timer);
        document.removeEventListener('visibilitychange', onVis);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    window.location.href = `tg://resolve?domain=${username}`;
  };

  const Toggle: React.FC<{ on: boolean; onClick: () => void }> = ({ on, onClick }) => (
    <button
      onClick={onClick}
      className={`relative w-12 h-7 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
        on ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-slate-300'
      }`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${
          on ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );

  const clearRow = (
    icon: React.ReactNode,
    label: string,
    count: number,
    onClear: () => void,
    delay: number
  ) => (
    <motion.div {...stagger(delay)} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${card}`}>
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-white/[0.06]' : 'bg-white shadow-sm'}`}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-[13px] font-bold ${rowText}`}>{label}</span>
        <span className={`block text-[11px] ${subText}`}>{count} item{count === 1 ? '' : 's'}</span>
      </span>
      <button
        onClick={onClear}
        disabled={count === 0}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide transition active:scale-95 ${
          count === 0
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-rose-500 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 cursor-pointer'
        }`}
      >
        <Trash2 className="w-3 h-3" /> Clear
      </button>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[8700] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className={`relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl border select-none ${
          dark ? 'bg-slate-950 text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 px-5 py-4">
          <div className="live-beam" style={{ left: '30%' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="font-display font-black text-lg text-white leading-none">Settings</h3>
              <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.22em] mt-1.5">
                Apna style, apna control
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white rounded-full bg-black/30 backdrop-blur hover:bg-black/50 transition cursor-pointer border border-white/25"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Theme */}
          <motion.div {...stagger(0.05)} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${card}`}>
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-white/[0.06]' : 'bg-white shadow-sm'}`}>
              {dark ? <Moon className="w-4.5 h-4.5 text-violet-400" /> : <Sun className="w-4.5 h-4.5 text-amber-500" />}
            </span>
            <span className="flex-1">
              <span className={`block text-[13px] font-bold ${rowText}`}>App Theme</span>
              <span className={`block text-[11px] ${subText}`}>{dark ? 'Dark mode on' : 'Light mode on'}</span>
            </span>
            <div className={`flex p-1 rounded-full border ${dark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
              <button
                onClick={() => dark && onToggleTheme()}
                className={`px-3 py-1 rounded-full text-[11px] font-black transition cursor-pointer ${!dark ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow' : 'text-slate-400'}`}
              >
                Light
              </button>
              <button
                onClick={() => !dark && onToggleTheme()}
                className={`px-3 py-1 rounded-full text-[11px] font-black transition cursor-pointer ${dark ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow' : 'text-slate-400'}`}
              >
                Dark
              </button>
            </div>
          </motion.div>

          {/* Animations */}
          <motion.div {...stagger(0.12)} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${card}`}>
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-white/[0.06]' : 'bg-white shadow-sm'}`}>
              <Sparkles className="w-4.5 h-4.5 text-fuchsia-500" />
            </span>
            <span className="flex-1">
              <span className={`block text-[13px] font-bold ${rowText}`}>Live Animations</span>
              <span className={`block text-[11px] ${subText}`}>{animationsOn ? 'Full motion effects on' : 'Effects off — faster, calmer'}</span>
            </span>
            <Toggle on={animationsOn} onClick={onToggleAnimations} />
          </motion.div>

          <motion.p {...stagger(0.18)} className="px-1 pt-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            My Data
          </motion.p>

          {clearRow(<History className="w-4.5 h-4.5 text-cyan-500" />, 'Recently Viewed', recentCount, onClearRecent, 0.22)}
          {clearRow(<Bookmark className="w-4.5 h-4.5 text-violet-500" />, 'Saved Apps', bookmarksCount, onClearBookmarks, 0.28)}
          {clearRow(<Download className="w-4.5 h-4.5 text-emerald-500" />, 'Download History', downloadsCount, onClearDownloads, 0.34)}

          <motion.p {...stagger(0.4)} className="px-1 pt-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            About
          </motion.p>

          <motion.button
            {...stagger(0.44)}
            onClick={handleOpenTelegram}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border ${card} cursor-pointer active:scale-[0.98] transition text-left`}
          >
            <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600 shadow-md shadow-sky-500/30">
              <Send className="w-4 h-4 text-white" />
            </span>
            <span className="flex-1">
              <span className={`block text-[13px] font-bold ${rowText}`}>Join Telegram Channel</span>
              <span className={`block text-[11px] ${subText}`}>@{STORE_CONFIG.OWNER_TELEGRAM_USERNAME} • Daily VIP updates</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </motion.button>

          <motion.div {...stagger(0.5)} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${card}`}>
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-white/[0.06]' : 'bg-white shadow-sm'}`}>
              <Info className="w-4.5 h-4.5 text-slate-400" />
            </span>
            <span className="flex-1">
              <span className={`block text-[13px] font-bold ${rowText}`}>{STORE_CONFIG.STORE_NAME}</span>
              <span className={`block text-[11px] ${subText}`}>VIP v1.0 • By {STORE_CONFIG.OWNER_NAME}</span>
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
