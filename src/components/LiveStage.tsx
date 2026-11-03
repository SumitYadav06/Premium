import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Download,
  Star,
  Eye,
  Home,
  Bookmark,
  User,
  Trophy,
  History,
  Trash2,
  Radio
} from 'lucide-react';
import { AppItem } from '../types';
import { VerifiedBadge } from './AppDetailView';

/* ================= LIVE BACKGROUND — video jaisa jeeta-jagta scene ================= */

const ORBS = [
  { left: '6%', size: 14, dur: 17, delay: 0, color: 'rgba(244,63,94,0.5)' },
  { left: '18%', size: 9, dur: 13, delay: 3, color: 'rgba(245,158,11,0.5)' },
  { left: '32%', size: 18, dur: 21, delay: 6, color: 'rgba(139,92,246,0.45)' },
  { left: '47%', size: 8, dur: 12, delay: 1.5, color: 'rgba(6,182,212,0.5)' },
  { left: '58%', size: 13, dur: 16, delay: 8, color: 'rgba(236,72,153,0.45)' },
  { left: '71%', size: 10, dur: 14, delay: 4.5, color: 'rgba(132,204,22,0.45)' },
  { left: '83%', size: 16, dur: 19, delay: 2, color: 'rgba(249,115,22,0.45)' },
  { left: '93%', size: 8, dur: 11, delay: 7, color: 'rgba(56,189,248,0.5)' }
];

export const LiveBackground: React.FC = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
    {/* Base living gradient wash */}
    <div className="absolute inset-0 aurora-layer" />
    {/* Stage light beams */}
    <div className="live-beam" style={{ left: '4%' }} />
    <div className="live-beam" style={{ left: '46%', animationDelay: '-5.5s' }} />
    {/* Rising orbs */}
    {ORBS.map((o, i) => (
      <span
        key={i}
        className="live-orb"
        style={{
          left: o.left,
          width: o.size,
          height: o.size,
          background: o.color,
          animationDuration: `${o.dur}s`,
          animationDelay: `${o.delay}s`,
          boxShadow: `0 0 18px 4px ${o.color}`
        }}
      />
    ))}
  </div>
);

/* ================= LIVE TICKER — news strip ================= */

interface LiveTickerProps {
  appsCount: number;
  totalDownloads: number;
  topNames: string[];
  theme: 'dark' | 'light';
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ appsCount, totalDownloads, topNames, theme }) => {
  const items = useMemo(() => {
    const base = [
      `${appsCount} Premium Apps Live`,
      `${totalDownloads.toLocaleString('en-IN')}+ Total Downloads`,
      '100% Virus Scanned & Verified',
      'New Mods Added Daily',
      'Fast VIP Servers — No Waiting'
    ];
    const withNames = base.concat(topNames.slice(0, 4).map((n) => `Trending: ${n}`));
    return withNames;
  }, [appsCount, totalDownloads, topNames]);

  const strip = (keyPrefix: string) => (
    <div className="flex items-center shrink-0" key={keyPrefix}>
      {items.map((t, i) => (
        <span key={`${keyPrefix}-${i}`} className="flex items-center gap-2 px-4 text-[11px] font-bold whitespace-nowrap">
          <Flame className="w-3 h-3 text-orange-400" />
          <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>{t}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`relative flex items-stretch rounded-2xl overflow-hidden border ${
        theme === 'dark' ? 'bg-slate-900/80 border-fuchsia-500/25' : 'bg-white/85 border-fuchsia-200 shadow-sm'
      } backdrop-blur-xl`}
    >
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white shrink-0 z-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <span className="text-[10px] font-black tracking-[0.2em] flex items-center gap-1">
          <Radio className="w-3 h-3" /> LIVE
        </span>
      </div>
      <div className="overflow-hidden flex-1 flex items-center">
        <div className="marquee-track">
          {strip('a')}
          {strip('b')}
        </div>
      </div>
    </div>
  );
};

/* ================= TOP CHARTS RAIL — horizontal ranking ================= */

interface RankedApp {
  app: AppItem;
  downloads: number;
}

interface TopChartsRailProps {
  ranked: RankedApp[];
  onSelect: (app: AppItem) => void;
  theme: 'dark' | 'light';
}

export const TopChartsRail: React.FC<TopChartsRailProps> = ({ ranked, onSelect, theme }) => {
  if (ranked.length === 0) return null;
  const top = ranked.slice(0, 10);

  return (
    <div className="space-y-2.5 anim-fade-up">
      <div className="flex items-center gap-2.5 px-1">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-400/40">
          <Trophy className="w-4 h-4 text-white" />
        </span>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-orange-500 leading-none mb-0.5">Charts</p>
          <h2 className={`font-display text-base sm:text-lg font-black leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Top 10 This Week
          </h2>
        </div>
        <span className="ml-auto flex items-end gap-[2.5px] h-4" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="eq-bar w-[3px] rounded-full bg-gradient-to-t from-rose-500 to-amber-400"
              style={{ height: '100%', animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none snap-x snap-mandatory select-none">
        {top.map(({ app, downloads }, idx) => (
          <motion.button
            key={app.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(idx * 0.05, 0.35), duration: 0.3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(app)}
            className={`snap-start shrink-0 w-[228px] text-left rounded-3xl p-3 flex items-center gap-3 border cursor-pointer transition ${
              theme === 'dark'
                ? 'bg-white/[0.05] border-white/10 hover:border-amber-400/50'
                : 'bg-white border-slate-200/90 hover:border-amber-300 shadow-[0_10px_26px_-12px_rgba(245,158,11,0.35)]'
            }`}
          >
            <span className="rank-num text-[42px] font-black leading-none w-11 text-center shrink-0">{idx + 1}</span>
            <img
              src={app.icon}
              alt={app.name}
              className="w-14 h-14 rounded-2xl object-cover bg-slate-900 shrink-0 shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
              }}
            />
            <span className="min-w-0 flex-1">
              <span className={`flex items-center gap-1 font-display font-bold text-[13px] leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <span className="truncate">{app.name}</span>
                <VerifiedBadge size={13} />
              </span>
              <span className="flex items-center gap-2 mt-1 text-[10.5px] font-semibold text-slate-400">
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {app.rating || '4.9'}
                </span>
                <span className="flex items-center gap-0.5">
                  <Download className="w-3 h-3" /> {downloads.toLocaleString('en-IN')}
                </span>
              </span>
              <span className="inline-block mt-1.5 text-[8.5px] font-black uppercase tracking-[0.16em] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/25">
                {app.cat}
              </span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

/* ================= RECENTLY VIEWED ================= */

interface RecentlyViewedRowProps {
  apps: AppItem[];
  onSelect: (app: AppItem) => void;
  onClear: () => void;
  theme: 'dark' | 'light';
}

export const RecentlyViewedRow: React.FC<RecentlyViewedRowProps> = ({ apps, onSelect, onClear, theme }) => {
  if (apps.length === 0) return null;

  return (
    <div className="space-y-2.5 anim-fade-up">
      <div className="flex items-center gap-2.5 px-1">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-400/40">
          <History className="w-4 h-4 text-white" />
        </span>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-cyan-600 leading-none mb-0.5">Jump Back In</p>
          <h2 className={`font-display text-base sm:text-lg font-black leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Recently Viewed
          </h2>
        </div>
        <button
          onClick={onClear}
          className="ml-auto flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 px-1 scrollbar-none select-none">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => onSelect(app)}
            className={`shrink-0 flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border cursor-pointer active:scale-95 transition ${
              theme === 'dark'
                ? 'bg-white/[0.05] border-white/10 text-slate-200'
                : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-cyan-300'
            }`}
          >
            <img src={app.icon} alt={app.name} className="w-7 h-7 rounded-full object-cover bg-slate-900" />
            <span className="text-[11px] font-bold max-w-[110px] truncate">{app.name}</span>
            <Eye className="w-3 h-3 text-cyan-500" />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ================= BOTTOM DOCK — floating navigation ================= */

interface BottomDockProps {
  onHome: () => void;
  onOpenBookmarks: () => void;
  onOpenDownloads: () => void;
  onOpenOwner: () => void;
  bookmarksCount: number;
  downloadsCount: number;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  onHome,
  onOpenBookmarks,
  onOpenDownloads,
  onOpenOwner,
  bookmarksCount,
  downloadsCount
}) => {
  const item =
    'relative flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-2xl cursor-pointer active:scale-90 transition-all duration-200';

  return (
    <motion.nav
      initial={{ y: 70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="dock-glass fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-2 py-1.5 rounded-[1.6rem]"
      aria-label="Quick navigation"
    >
      <button onClick={onHome} className={`${item} text-fuchsia-600 hover:bg-fuchsia-500/10`}>
        <Home className="w-5 h-5" />
        <span className="text-[9px] font-black uppercase tracking-wider">Home</span>
      </button>

      <button onClick={onOpenBookmarks} className={`${item} text-violet-500 hover:bg-violet-500/10`}>
        <Bookmark className="w-5 h-5" />
        <span className="text-[9px] font-black uppercase tracking-wider">Saved</span>
        {bookmarksCount > 0 && (
          <span className="absolute top-0.5 right-2 min-w-4 h-4 px-0.5 bg-fuchsia-500 text-white rounded-full text-[8.5px] font-black flex items-center justify-center shadow">
            {bookmarksCount}
          </span>
        )}
      </button>

      <button onClick={onOpenDownloads} className={`${item} text-emerald-500 hover:bg-emerald-500/10`}>
        <Download className="w-5 h-5" />
        <span className="text-[9px] font-black uppercase tracking-wider">Files</span>
        {downloadsCount > 0 && (
          <span className="absolute top-0.5 right-2 min-w-4 h-4 px-0.5 bg-emerald-500 text-white rounded-full text-[8.5px] font-black flex items-center justify-center shadow animate-pulse">
            {downloadsCount}
          </span>
        )}
      </button>

      <button onClick={onOpenOwner} className={`${item} text-sky-500 hover:bg-sky-500/10`}>
        <User className="w-5 h-5" />
        <span className="text-[9px] font-black uppercase tracking-wider">Creator</span>
        <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      </button>
    </motion.nav>
  );
};
