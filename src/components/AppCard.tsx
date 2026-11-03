import React from 'react';
import { motion } from 'motion/react';
import {
  Star,
  Bookmark,
  Sparkles,
  Download,
  Play
} from 'lucide-react';
import { AppItem } from '../types';
import { VerifiedBadge } from './AppDetailView';

interface AppCardProps {
  app: AppItem;
  views: number;
  downloads?: number;
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

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';

/** POSTER CARD — upar video-thumbnail jaisa artwork zone, neeche info */
export const AppCard: React.FC<AppCardProps> = ({
  app,
  views,
  downloads,
  isBookmarked,
  onSelect,
  onToggleBookmark,
  theme,
  index = 0
}) => {
  const grad = gradientFor(app.cat);
  const dls = downloads ?? app.downloads ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.045, 0.4), duration: 0.32 }}
      onClick={() => onSelect(app)}
      className={`premium-card group relative rounded-[1.6rem] flex flex-col cursor-pointer border select-none overflow-hidden transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-white/[0.05] backdrop-blur-xl border-white/10 hover:border-fuchsia-400/50 shadow-lg shadow-black/30'
          : 'bg-white border-slate-200/90 hover:border-fuchsia-300 shadow-[0_12px_32px_-12px_rgba(109,40,217,0.18)] hover:shadow-[0_24px_44px_-14px_rgba(217,70,239,0.35)]'
      }`}
    >
      {/* ===== Artwork zone — poster / video thumbnail ===== */}
      <div className={`relative h-[104px] sm:h-[116px] bg-gradient-to-br ${grad}`}>
        {/* Artwork backdrop — sirf ye hissa clip hota hai, floating icon NAHI */}
        <div className="absolute inset-0 overflow-hidden rounded-t-[1.6rem]">
          <img
            src={app.p1 || app.icon || FALLBACK_IMG}
            alt=""
            aria-hidden="true"
            className="kenburns absolute inset-0 w-full h-full object-cover opacity-45"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMG;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/10" />
          <div className="poster-glow absolute -top-8 left-1/3 w-28 h-28 rounded-full bg-white/35 blur-2xl" aria-hidden="true" />
        </div>

        {/* HOT badge */}
        {app.isHot && (
          <span className="absolute top-2.5 left-2.5 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/30 uppercase tracking-wider">
            HOT
          </span>
        )}

        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(app);
          }}
          className={`absolute top-2 right-2 z-20 p-1.5 rounded-full border backdrop-blur transition active:scale-90 ${
            isBookmarked
              ? 'bg-white border-white text-fuchsia-600'
              : 'bg-black/25 border-white/30 text-white hover:bg-black/40'
          }`}
          title={isBookmarked ? 'Remove from Saved' : 'Save to Favorites'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-fuchsia-600' : ''}`} />
        </button>

        {/* Center play-style button — tap = detail khulta hai */}
        <span className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-white/20 border border-white/45 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
          <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
        </span>

        {/* Floating icon — artwork se bahar nikalta hua */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 z-10">
          <div className="relative">
            <div className="absolute -inset-[3px] rounded-[24px] ring-conic opacity-0 group-hover:opacity-90 transition-opacity duration-300" aria-hidden="true" />
            <img
              src={app.icon || FALLBACK_IMG}
              alt={app.name}
              className="relative w-[68px] h-[68px] rounded-[21px] object-cover bg-slate-950 block border-[2.5px] border-white shadow-xl group-hover:scale-[1.06] transition duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMG;
              }}
            />
            {app.isFeatured && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-0.5 whitespace-nowrap">
                <Sparkles className="w-2.5 h-2.5" /> VIP
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== Info zone ===== */}
      <div className="flex flex-col items-center text-center gap-1.5 px-3 pt-9 pb-4">
        <div className="flex items-start justify-center gap-1 min-w-0 max-w-full">
          <h3
            className={`font-display font-bold text-[14.5px] leading-snug line-clamp-1 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            } group-hover:text-fuchsia-500 transition`}
          >
            {app.name}
          </h3>
          <span className="shrink-0 mt-[3px]">
            <VerifiedBadge size={14} />
          </span>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold flex-wrap">
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {app.rating || '4.9'}
          </span>
          <span className="text-slate-300">•</span>
          <span>{app.mb} MB</span>
          <span className="text-slate-300">•</span>
          {dls > 0 ? (
            <span className="flex items-center gap-0.5">
              <Download className="w-3 h-3" />
              {dls.toLocaleString('en-IN')}
            </span>
          ) : (
            <span>v{app.ver}</span>
          )}
        </div>

        <span className={`text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-gradient-to-r ${grad} text-white shadow-sm`}>
          {app.cat}
        </span>
      </div>

      {/* Bottom shine sweep on hover */}
      <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-10" />
    </motion.div>
  );
};
