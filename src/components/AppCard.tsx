import React from 'react';
import { motion } from 'motion/react';
import {
  Download,
  Star,
  Bookmark,
  Sparkles,
  Eye,
  Share2
} from 'lucide-react';
import { AppItem } from '../types';
import { VerifiedBadge } from './AppDetailView';
import { STORE_CONFIG } from '../config';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.3 }}
      className={`group relative rounded-[2rem] p-4 transition-all duration-300 border select-none overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/80 hover:border-amber-500/40 shadow-lg shadow-black/40 hover:shadow-amber-500/10'
          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-400/60 shadow-md shadow-slate-200/50'
      }`}
    >
      {/* Unique Premium Trick: Holographic Light-Streak Shimmer on Hover */}
      <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

      <div className="flex items-center gap-4 relative z-10">
        {/* App Icon with Hot / VIP Badge */}
        <div
          onClick={() => onSelect(app)}
          className="relative flex-shrink-0 cursor-pointer"
        >
          <div className="p-0.5 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-400/80 via-rose-500/80 to-purple-600/80 shadow-md group-hover:scale-105 group-hover:shadow-pink-500/25 transition duration-300">
            <img
              src={app.icon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"}
              alt={app.name}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-[14px] sm:rounded-[22px] object-cover bg-slate-950"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {app.isHot && (
            <span className="absolute -top-1.5 -left-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/20 uppercase tracking-wider">
              HOT
            </span>
          )}
        </div>

        {/* Info Column */}
        <div
          onClick={() => onSelect(app)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
            <h3
              className={`font-black text-sm sm:text-base truncate ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              } group-hover:text-purple-400 transition`}
            >
              {app.name}
            </h3>
            <VerifiedBadge size={16} />
          </div>

          <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            v{app.ver} • {app.mb} MB
          </p>

          <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-[11px] text-slate-400 flex-wrap">
            {/* Rating */}
            <div className="flex items-center gap-1 text-yellow-400 font-bold">
              <Star className="w-3 h-3 fill-yellow-400" />
              <span>{app.rating || '4.9'}</span>
            </div>

            <span>•</span>

            {/* Views / Downloads */}
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-500" />
              <span>{views > 0 ? views.toLocaleString() : (app.downloads ? `${(app.downloads / 1000).toFixed(0)}k` : '1.2k')}</span>
            </div>

            <span>•</span>

            {/* Category tag */}
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
              {app.cat}
            </span>
          </div>
        </div>

        {/* Actions Column */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            {/* Quick WhatsApp Share Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const storeLink = STORE_CONFIG.STORE_BASE_URL || window.location.href.split('#')[0];
                const apkLink = app.link || (app as any).url || 'https://archive.org/download/sample-apk-files/sample-app.apk';
                const text = `🔥 *${app.name}* (v${app.ver}) - VIP MOD APK\n` +
                  `⚡ Size: ${app.mb} MB | Status: Verified ✅\n\n` +
                  `📥 *Direct APK Download:*\n${apkLink}\n\n` +
                  `🌐 *Store Link:*\n${storeLink}\n\n` +
                  `👑 Shared from *${STORE_CONFIG.OWNER_NAME}'s Premium Store*`;
                const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
              }}
              className={`p-1.5 rounded-xl border transition ${
                theme === 'dark'
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/40'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-emerald-600'
              }`}
              title="Share on WhatsApp (APK + Store Links)"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Bookmark Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(app);
              }}
              className={`p-1.5 rounded-xl border transition ${
                isBookmarked
                  ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                  : theme === 'dark'
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-500 hover:text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isBookmarked ? 'Remove from Saved' : 'Save to Favorites'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-purple-400' : ''}`} />
            </button>
          </div>

          {/* Quick Direct Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickDownload(app);
            }}
            className="flex items-center gap-1 py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-400 hover:via-rose-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-pink-600/20 active:scale-95 transition cursor-pointer"
            title="Direct Download APK"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
