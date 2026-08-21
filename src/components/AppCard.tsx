import React from 'react';
import { motion } from 'motion/react';
import {
  Download,
  Star,
  ShieldCheck,
  Bookmark,
  Sparkles,
  Eye,
  Check
} from 'lucide-react';
import { AppItem } from '../types';

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
      className={`group relative rounded-[2rem] p-4 transition-all duration-200 border select-none ${
        theme === 'dark'
          ? 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-purple-500/40 shadow-lg shadow-black/40'
          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-400 shadow-md shadow-slate-200/50'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* App Icon with Hot Badge */}
        <div
          onClick={() => onSelect(app)}
          className="relative flex-shrink-0 cursor-pointer"
        >
          <img
            src={app.icon}
            alt={app.name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl object-cover border border-purple-500/20 shadow-md group-hover:scale-105 transition duration-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
            }}
          />

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
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3
              className={`font-black text-sm sm:text-base truncate ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              } group-hover:text-purple-400 transition`}
            >
              {app.name}
            </h3>
            <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
          </div>

          <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            v{app.ver} • {app.mb} MB
          </p>

          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
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
            <span className="text-[10px] uppercase font-semibold px-2 py-0.2 rounded-md bg-slate-800 text-slate-300">
              {app.cat}
            </span>
          </div>
        </div>

        {/* Actions Column */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
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

          {/* Quick Direct Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickDownload(app);
            }}
            className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-purple-600/20 active:scale-95 transition"
            title="Direct Download APK"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Get</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
