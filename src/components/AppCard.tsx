import React from 'react';
import { motion } from 'motion/react';
import {
  Star,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { AppItem } from '../types';
import { VerifiedBadge } from './AppDetailView';

interface AppCardProps {
  app: AppItem;
  views: number;
  isBookmarked: boolean;
  onSelect: (app: AppItem) => void;
  onQuickDownload: (app: AppItem) => void;
  onToggleBookmark: (app: AppItem) => void;
  theme: 'dark' | 'light';
  index?: number;
}

/** Har category ka apna rang — colorful premium feel */
const CAT_GRADIENTS: [string, string][] = [
  ['game', 'from-violet-500 via-purple-500 to-fuchsia-500'],
  ['mod', 'from-rose-500 via-pink-500 to-orange-400'],
  ['tool', 'from-emerald-400 via-teal-500 to-cyan-500'],
  ['entertainment', 'from-amber-400 via-orange-500 to-rose-500'],
  ['music', 'from-fuchsia-500 via-pink-500 to-rose-400'],
  ['video', 'from-red-500 via-rose-500 to-pink-500'],
  ['photo', 'from-cyan-400 via-sky-500 to-blue-600'],
  ['social', 'from-blue-500 via-indigo-500 to-violet-500'],
  ['editor', 'from-teal-400 via-emerald-500 to-lime-500'],
  ['browser', 'from-sky-400 via-cyan-500 to-teal-400'],
];

const gradientFor = (cat: string): string => {
  const key = (cat || '').toLowerCase();
  const hit = CAT_GRADIENTS.find(([k]) => key.includes(k));
  return hit ? hit[1] : 'from-violet-500 via-fuchsia-500 to-orange-400';
};

export const AppCard: React.FC<AppCardProps> = ({
  app,
  views,
  isBookmarked,
  onSelect,
  onQuickDownload,
  onToggleBookmark,
  theme,
  index = 0
}) => {
  const grad = gradientFor(app.cat);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.3 }}
      onClick={() => onSelect(app)}
      className={`premium-card group relative rounded-[1.75rem] px-3 py-5 sm:px-4 flex flex-col items-center text-center gap-2.5 cursor-pointer border select-none overflow-hidden transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-white/[0.05] backdrop-blur-xl border-white/10 hover:border-fuchsia-400/50 shadow-lg shadow-black/30'
          : 'bg-white border-slate-200/90 hover:border-fuchsia-300 shadow-[0_12px_32px_-12px_rgba(109,40,217,0.18)] hover:shadow-[0_24px_44px_-14px_rgba(217,70,239,0.35)]'
      }`}
    >
      {/* Holographic Light-Streak Shimmer on Hover */}
      <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-10" />

      {/* HOT Badge */}
      {app.isHot && (
        <span className="absolute top-3 left-3 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/30 uppercase tracking-wider">
          HOT
        </span>
      )}

      {/* Bookmark Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleBookmark(app);
        }}
        className={`absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full border transition active:scale-90 ${
          isBookmarked
            ? 'bg-fuchsia-600/15 border-fuchsia-500 text-fuchsia-500'
            : theme === 'dark'
            ? 'bg-white/[0.05] border-white/10 text-slate-400 hover:text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-fuchsia-500 hover:border-fuchsia-300'
        }`}
        title={isBookmarked ? 'Remove from Saved' : 'Save to Favorites'}
      >
        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-fuchsia-500' : ''}`} />
      </button>

      {/* App Icon — big, centered, category-color ring */}
      <div className="relative mt-1.5">
        <div className={`p-[2.5px] rounded-[26px] bg-gradient-to-tr ${grad} shadow-lg group-hover:scale-[1.07] group-hover:rotate-2 transition duration-300`}>
          <img
            src={app.icon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"}
            alt={app.name}
            className="w-[76px] h-[76px] rounded-[24px] object-cover bg-slate-950 block"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {app.isFeatured && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-0.5 whitespace-nowrap">
            <Sparkles className="w-2.5 h-2.5" /> VIP
          </span>
        )}
      </div>

      {/* App Name */}
      <div className="flex items-start justify-center gap-1 mt-2 min-w-0 max-w-full">
        <h3
          className={`font-display font-bold text-[15px] leading-snug line-clamp-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          } group-hover:text-fuchsia-500 transition`}
        >
          {app.name}
        </h3>
        <span className="shrink-0 mt-[3px]">
          <VerifiedBadge size={15} />
        </span>
      </div>

      {/* Meta — rating, size, version */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold flex-wrap">
        <span className="flex items-center gap-1 text-amber-500 font-bold">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {app.rating || '4.9'}
        </span>
        <span className="text-slate-300">•</span>
        <span>{app.mb} MB</span>
        <span className="text-slate-300">•</span>
        <span>v{app.ver}</span>
      </div>

      {/* Category Chip */}
      <span className="text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/25">
        {app.cat}
      </span>
    </motion.div>
  );
};
