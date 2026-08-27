import React from 'react';
import { motion } from 'motion/react';
import { Bookmark, Trash2, X, Download, Star, ChevronRight } from 'lucide-react';
import { AppItem } from '../types';
import { VerifiedBadge } from './AppDetailView';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedApps: AppItem[];
  onSelectApp: (app: AppItem) => void;
  onRemoveBookmark: (app: AppItem) => void;
  onClearAll: () => void;
  theme: 'dark' | 'light';
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarkedApps = [],
  onSelectApp,
  onRemoveBookmark,
  onClearAll,
  theme
}) => {
  if (!isOpen) return null;
  const safeBookmarks = Array.isArray(bookmarkedApps) ? bookmarkedApps : [];

  return (
    <div className="fixed inset-0 z-[8500] flex justify-end bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className={`w-full max-w-md h-full flex flex-col p-6 shadow-2xl border-l select-none ${
          theme === 'dark'
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Bookmark className="w-5 h-5 fill-purple-400" />
            </div>
            <div>
              <h3 className="font-black text-base text-white leading-none">
                Saved Favorites
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {safeBookmarks.length} App{safeBookmarks.length === 1 ? '' : 's'} bookmarked
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {safeBookmarks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Bookmark className="w-12 h-12 stroke-[1.5] mb-3 text-slate-600" />
              <p className="text-sm font-bold text-slate-400">No Saved Apps</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Tap the bookmark ribbon on any app card to save it here for fast access later.
              </p>
            </div>
          ) : (
            safeBookmarks.map((app, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 shadow-md group cursor-pointer hover:border-purple-500/40 transition"
                onClick={() => {
                  onSelectApp(app);
                  onClose();
                }}
              >
                <img
                  src={app.icon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"}
                  alt={app.name}
                  className="w-12 h-12 rounded-xl object-cover border border-purple-500/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-xs text-white truncate group-hover:text-purple-300">
                      {app.name}
                    </h4>
                    <VerifiedBadge size={14} />
                  </div>
                  <p className="text-[10px] text-purple-400 font-mono">
                    v{app.ver} • {app.mb} MB
                  </p>
                  <div className="flex items-center gap-1 text-yellow-400 text-[10px] mt-0.5">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    <span>{app.rating || 4.9}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(app);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-xl hover:bg-slate-800 transition"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {safeBookmarks.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove All
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
