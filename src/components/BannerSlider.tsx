import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Download, Star, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import { AppItem } from '../types';
import { VerifiedBadge } from './AppDetailView';

interface BannerSliderProps {
  apps: AppItem[];
  onSelectApp: (app: AppItem) => void;
  onQuickDownload: (app: AppItem) => void;
  theme: 'dark' | 'light';
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
  apps = [],
  onSelectApp,
  onQuickDownload,
  theme
}) => {
  const safeApps = Array.isArray(apps) ? apps : [];
  const featuredApps = safeApps.filter((a) => a && (a.isFeatured || a.isHot)).slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredApps.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [featuredApps.length]);

  if (featuredApps.length === 0) return null;

  const current = featuredApps[currentIndex] || featuredApps[0];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-purple-500/20 mb-8 select-none group">
      {/* Background with Artwork Banner */}
      <div className="relative h-64 sm:h-72 w-full bg-slate-950 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={current.id || current.name}
            src={current.p1 || current.icon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"}
            alt={current.name}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 w-full h-full object-cover filter blur-[2px]"
          />
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />

        {/* Foreground Content */}
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
          <div className="flex items-start gap-4">
            <img
              src={current.icon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"}
              alt={current.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-purple-500/40 shadow-xl flex-shrink-0 cursor-pointer"
              onClick={() => onSelectApp(current)}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> FEATURED VIP
                </span>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                  {current.cat}
                </span>
              </div>

              <h2
                onClick={() => onSelectApp(current)}
                className="text-xl sm:text-2xl font-black text-white truncate cursor-pointer hover:text-purple-300 transition flex items-center gap-1.5"
              >
                <span>{current.name}</span>
                <VerifiedBadge size={18} />
              </h2>

              <p className="text-xs text-slate-300 line-clamp-2 max-w-lg mt-1 font-normal">
                {current.desc}
              </p>

              {/* Stats & Actions */}
              <div className="flex items-center gap-3 sm:gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  <span>{current.rating || '4.9'}</span>
                </div>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-xs text-slate-300 font-medium">
                  {current.mb} MB
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Safe
                </span>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => onSelectApp(current)}
                    className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onQuickDownload(current)}
                    className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-400 hover:via-rose-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-pink-600/30 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {featuredApps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 bg-purple-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
