import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, ShieldCheck, Play } from 'lucide-react';
import { AppItem } from '../types';
import { VerifiedBadge } from './VerifiedBadge';

interface BannerSliderProps {
  apps: AppItem[];
  onSelectApp: (app: AppItem) => void;
  onQuickDownload: (app: AppItem) => void;
  theme: 'dark' | 'light';
}

const AUTO_SLIDE_DURATION = 4500; // 4.5 seconds

/** CINEMA SPOTLIGHT — live video jaisa hero: Ken Burns artwork, LIVE badge, video timeline */
export const BannerSlider: React.FC<BannerSliderProps> = ({
  apps = [],
  onSelectApp
}) => {
  const safeApps = Array.isArray(apps) ? apps : [];
  const flaggedApps = safeApps.filter((a) => a && (a.isFeatured || a.isHot));
  // Koi app Featured/HOT flag na ho to hero gayab mat karo — pehle apps hi dikha do
  const featuredApps = (flaggedApps.length > 0 ? flaggedApps : safeApps.filter((a) => a && a.name)).slice(0, 6);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  const handleNext = useCallback(() => {
    if (featuredApps.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
  }, [featuredApps.length]);

  const handlePrev = useCallback(() => {
    if (featuredApps.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + featuredApps.length) % featuredApps.length);
  }, [featuredApps.length]);

  // Data refresh me list chhoti ho jaye to index ko hamesha range me rakho (counter "6 / 3" na bane)
  useEffect(() => {
    if (currentIndex >= featuredApps.length) setCurrentIndex(0);
  }, [featuredApps.length, currentIndex]);

  useEffect(() => {
    if (featuredApps.length <= 1 || isPaused) return;
    timerRef.current = setInterval(() => {
      handleNext();
    }, AUTO_SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [featuredApps.length, isPaused, handleNext, currentIndex]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    isDragging.current = true;
    setIsPaused(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || dragStartX.current === null) return;
    const diff = dragStartX.current - e.clientX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    dragStartX.current = null;
    isDragging.current = false;
    setIsPaused(false);
  };

  const handlePointerCancel = () => {
    dragStartX.current = null;
    isDragging.current = false;
    setIsPaused(false);
  };

  if (featuredApps.length === 0) return null;

  const current = featuredApps[currentIndex] || featuredApps[0];

  return (
    <div
      className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-fuchsia-900/30 border border-white/20 select-none touch-pan-y cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-72 sm:h-80 w-full bg-slate-950 overflow-hidden">
        {/* Ken Burns living artwork — video ki tarah dheere move hoti hui */}
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={current.id || current.name}
            custom={direction}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={current.p1 || current.icon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"}
              alt={current.name}
              className="kenburns w-full h-full object-cover opacity-70"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                if (!t.dataset.fb) {
                  t.dataset.fb = '1';
                  t.src = current.icon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
                } else {
                  t.style.opacity = '0';
                }
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-transparent to-fuchsia-900/30 pointer-events-none" />

        {/* Top bar: LIVE badge + equalizer + spotlight label */}
        <div className="absolute top-0 inset-x-0 p-4 sm:p-5 flex items-center gap-2.5 pointer-events-none">
          <span className="ml-auto text-[10px] font-bold text-white/70 bg-black/35 backdrop-blur px-2 py-1 rounded-full border border-white/15">
            {currentIndex + 1} / {featuredApps.length}
          </span>
        </div>

        {/* Foreground content */}
        <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || current.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32 }}
              className="flex items-end gap-3.5 sm:gap-5"
            >
              <div className="relative shrink-0 hidden xs:block sm:block">
                <div className="absolute -inset-1.5 rounded-[26px] ring-conic opacity-70 blur-[6px]" aria-hidden="true" />
                <img
                  src={current.icon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"}
                  alt={current.name}
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    if (!t.dataset.fb) {
                      t.dataset.fb = '1';
                      t.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80";
                    } else {
                      t.style.opacity = '0';
                    }
                  }}
                  className="relative w-[74px] h-[74px] sm:w-24 sm:h-24 rounded-[22px] object-cover border-2 border-white/50 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectApp(current);
                  }}
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl border border-slate-200">
                  <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                </span>
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="bg-gradient-to-r from-rose-500 to-orange-400 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Featured
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">{current.cat}</span>
                  <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Safe
                  </span>
                </div>

                <h2
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectApp(current);
                  }}
                  className="font-display text-[22px] sm:text-[32px] font-black text-white leading-tight cursor-pointer hover:text-amber-200 transition flex items-center gap-1.5"
                >
                  <span className="truncate">{current.name}</span>
                  <VerifiedBadge size={20} />
                </h2>

                <p className="text-[11.5px] sm:text-xs text-slate-200/90 line-clamp-2 max-w-lg mt-1 font-normal">
                  {current.desc}
                </p>

                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-yellow-300 font-bold">
                    <Star className="w-3.5 h-3.5 fill-yellow-300" /> {current.rating || '4.9'}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">{current.mb} MB</span>
                  <span className="text-xs text-slate-300 font-medium">v{current.ver}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectApp(current);
                    }}
                    className="btn-shine btn-live ml-auto py-2.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-fuchsia-600/50 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>View App</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Video-style timeline segments */}
          <div className="flex items-center gap-1.5 mt-4">
            {featuredApps.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className="flex-1 h-[5px] rounded-full bg-white/25 overflow-hidden cursor-pointer"
                aria-label={`Slide ${idx + 1}`}
              >
                {idx < currentIndex && <div className="h-full w-full bg-white/85 rounded-full" />}
                {idx === currentIndex && (
                  <div
                    key={`prog-${currentIndex}`}
                    className={`h-full bg-gradient-to-r from-rose-400 via-fuchsia-400 to-amber-300 rounded-full slide-progress ${isPaused ? 'paused' : ''}`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
