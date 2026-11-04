import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, Zap, Star } from 'lucide-react';
import { STORE_CONFIG } from '../config';

interface SplashViewProps {
  logoUrl?: string;
  onFinish?: () => void;
}

const STEPS = [
  'Starting Engine...',
  'Verifying Anti-Ban Mod Keys...',
  'Unlocking Premium Catalog...',
  'Welcome to the Hub!'
];

/** AURORA INTRO — naya cinematic intro: rotating rings, letter-by-letter naam, % counter */
export const SplashView: React.FC<SplashViewProps> = ({
  logoUrl = STORE_CONFIG.STORE_SPLASH_LOGO,
  onFinish
}) => {
  const [percent, setPercent] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // Smooth % counter 0 -> 100
  useEffect(() => {
    const iv = setInterval(() => {
      setPercent((p) => {
        const next = p + Math.floor(Math.random() * 7) + 4;
        if (next >= 100) {
          clearInterval(iv);
          return 100;
        }
        return next;
      });
    }, 52);
    return () => clearInterval(iv);
  }, []);

  const stepText = STEPS[Math.min(STEPS.length - 1, Math.floor(percent / 30))];

  useEffect(() => {
    const autoCloseTimer = setTimeout(() => handleDismiss(), 1250);
    return () => clearTimeout(autoCloseTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 320);
  };

  const nameLetters = (STORE_CONFIG.STORE_NAME || 'Apna Jugaad').split('');

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -60, scale: 1.04 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden cursor-pointer bg-[#fdfaff]"
        >
          {/* Living mesh background */}
          <div className="absolute w-[28rem] h-[28rem] bg-fuchsia-400/35 rounded-full blur-[120px] -top-32 -left-24 animate-pulse" />
          <div className="absolute w-[26rem] h-[26rem] bg-amber-300/35 rounded-full blur-[120px] -bottom-32 -right-20 animate-pulse" />
          <div className="absolute w-80 h-80 bg-cyan-300/30 rounded-full blur-[100px] top-1/3 right-1/4 animate-pulse" />
          <div className="live-beam" style={{ left: '12%' }} />
          <div className="live-beam" style={{ left: '58%', animationDelay: '-6s' }} />
          {[
            { left: '14%', size: 10, dur: 11, delay: 0, color: 'rgba(236,72,153,0.55)' },
            { left: '38%', size: 7, dur: 9, delay: 2, color: 'rgba(245,158,11,0.55)' },
            { left: '66%', size: 11, dur: 12, delay: 1, color: 'rgba(139,92,246,0.5)' },
            { left: '86%', size: 8, dur: 10, delay: 3, color: 'rgba(6,182,212,0.55)' }
          ].map((o, i) => (
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
                boxShadow: `0 0 16px 3px ${o.color}`
              }}
            />
          ))}

          <div className="relative flex flex-col items-center text-center z-10 max-w-sm w-full">
            {/* Logo — do ghumte hue rings ke beech */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 15 }}
              className="relative mb-6"
            >
              <div className="absolute -inset-3.5 rounded-[3rem] ring-conic opacity-80 blur-[3px]" aria-hidden="true" />
              <div
                className="absolute -inset-3.5 rounded-[3rem] ring-conic opacity-50"
                style={{ animationDirection: 'reverse', animationDuration: '9s' }}
                aria-hidden="true"
              />
              <div className="anim-float relative w-40 h-40 sm:w-48 sm:h-48 rounded-[2.6rem] overflow-hidden bg-white border-[3px] border-white shadow-2xl shadow-fuchsia-300/60 p-1.5">
                <img
                  src={logoUrl || STORE_CONFIG.STORE_SPLASH_LOGO || STORE_CONFIG.STORE_APP_ICON}
                  alt={STORE_CONFIG.STORE_NAME}
                  className="w-full h-full object-cover rounded-[2.1rem]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('raw.githubusercontent.com')) {
                      target.src = 'https://raw.githubusercontent.com/SumitYadav06/Premium/main/app-icon.png';
                    }
                  }}
                />
              </div>
            </motion.div>

            {/* Naam — letter by letter */}
            <h1 className="brand-glow font-display text-[34px] sm:text-[42px] font-black tracking-tight leading-[1.25] pb-1 mb-2 flex flex-wrap justify-center" aria-label={STORE_CONFIG.STORE_NAME}>
              {nameLetters.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 22, rotateX: 80 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.25 + i * 0.045, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                  className="rainbow-text inline-block"
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.6em' }}
              animate={{ opacity: 1, letterSpacing: '0.28em' }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="text-[10px] sm:text-[11px] text-fuchsia-600 font-black uppercase mb-5"
            >
              {STORE_CONFIG.STORE_TAGLINE}
            </motion.p>

            {/* Equalizer */}
            <div className="flex items-end gap-[3.5px] h-6 mb-6" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="eq-bar w-[4.5px] rounded-full bg-gradient-to-t from-rose-500 via-fuchsia-500 to-amber-400 origin-bottom"
                  style={{ height: '100%', animationDelay: `${i * 0.1}s`, animationDuration: `${0.6 + (i % 3) * 0.15}s` }}
                />
              ))}
            </div>

            {/* Progress card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.45 }}
              className="w-full p-4 rounded-3xl bg-white/85 border border-violet-200/80 backdrop-blur-xl shadow-2xl shadow-violet-200/60"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="flex items-center gap-1.5 text-[11px] text-fuchsia-600 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  {stepText}
                </span>
                <span className="font-display text-lg font-black rainbow-text leading-none">{percent}%</span>
              </div>

              <div className="relative w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-violet-100 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 via-amber-400 to-cyan-400 transition-[width] duration-100 ease-linear shadow-lg shadow-fuchsia-400/40"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-200/80 grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-500">
                <div className="flex items-center justify-center gap-1 text-emerald-500">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Virus Clean</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fast Server</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-rose-500">
                  <Star className="w-3.5 h-3.5" />
                  <span>Top Mods</span>
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-3.5 text-[11px] text-slate-400 font-medium"
            >
              Tap anywhere to skip
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-4 text-[11px] text-slate-500 font-medium tracking-wide"
          >
            Crafted by <span className="rainbow-text font-black">{STORE_CONFIG.OWNER_NAME}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
