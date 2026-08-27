import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, Zap, Star, ArrowRight } from 'lucide-react';
import { STORE_CONFIG } from '../config';

interface SplashViewProps {
  logoUrl?: string;
  onFinish?: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({
  logoUrl = STORE_CONFIG.STORE_SPLASH_LOGO,
  onFinish
}) => {
  const [loadStep, setLoadStep] = useState('Initializing VIP Security Core...');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLoadStep('Verifying 100% Anti-Ban Mod Keys...'), 300);
    const t2 = setTimeout(() => setLoadStep('Unlocking Premium Store Catalog...'), 650);
    const t3 = setTimeout(() => setLoadStep('Welcome to Premium Hub!'), 1000);

    // Guaranteed fast Auto-Dismiss after 1.4 seconds
    const autoCloseTimer = setTimeout(() => {
      handleDismiss();
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(autoCloseTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 200);
  };

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[99999] bg-[#030712] flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden cursor-pointer"
        >
          {/* Ambient background glow circles */}
          <div className="absolute w-96 h-96 bg-purple-600/25 rounded-full blur-[130px] pointer-events-none -top-20 -left-20 animate-pulse" />
          <div className="absolute w-96 h-96 bg-pink-600/25 rounded-full blur-[130px] pointer-events-none -bottom-20 -right-20 animate-pulse" />
          <div className="absolute w-80 h-80 bg-blue-600/20 rounded-full blur-[110px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          {/* Main Container */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex flex-col items-center text-center z-10 max-w-sm w-full"
          >
            {/* Logo with Glowing Rainbow Border */}
            <div className="relative mb-5 group">
              <div className="absolute -inset-2.5 bg-gradient-to-r from-purple-600 via-pink-500 via-amber-400 to-cyan-400 rounded-[2.8rem] blur-lg opacity-85 animate-pulse"></div>
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-[2.4rem] overflow-hidden bg-slate-950 border-2 border-purple-400/60 shadow-2xl p-1.5 flex items-center justify-center">
                <img
                  src={logoUrl || STORE_CONFIG.STORE_SPLASH_LOGO || "https://i.ibb.co/HffVtwhY/image.jpg"}
                  alt={STORE_CONFIG.STORE_NAME}
                  className="w-full h-full object-cover rounded-[2rem]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://i.ibb.co/HffVtwhY/image.jpg";
                  }}
                />
              </div>
              
              {/* Gold VIP Luxury Badge */}
              <div className="absolute -bottom-2.5 -right-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-2xl shadow-amber-500/50 flex items-center gap-1 border border-amber-200 ring-2 ring-slate-950">
                <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" /> VIP HUB
              </div>
            </div>

            {/* Title with Aurora Text */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl font-black tracking-tight mb-1 rainbow-text drop-shadow font-mono"
            >
              {STORE_CONFIG.STORE_NAME}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-purple-300/90 font-semibold tracking-wider uppercase mb-5"
            >
              {STORE_CONFIG.STORE_TAGLINE}
            </motion.p>

            {/* High-Tech Security Matrix Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="w-full p-4 rounded-3xl bg-slate-900/90 border border-purple-500/40 backdrop-blur-xl shadow-2xl shadow-purple-950/60"
            >
              {/* Status Text & Version */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-2.5">
                <span className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>{loadStep}</span>
                </span>
                <span className="text-amber-400 font-black text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                  VIP v1.0
                </span>
              </div>

              {/* Animated 3D Gradient Progress Bar */}
              <div className="relative w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-purple-900/50 p-0.5 shadow-inner">
                <motion.div
                  initial={{ width: "10%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 via-amber-400 to-emerald-400 shadow-lg shadow-pink-500/50"
                />
              </div>

              {/* 3 Quick Security Badges */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-[10px] font-semibold text-slate-400">
                <div className="flex items-center justify-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Virus Clean</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-pink-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fast Server</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5" />
                  <span>VIP Mod</span>
                </div>
              </div>
            </motion.div>

            {/* Tap to skip hint */}
            <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <span>Loading store...</span>
              <span className="text-purple-400 underline decoration-purple-400/40">Tap anywhere to skip</span>
            </div>
          </motion.div>

          {/* Footer Brand */}
          <div className="absolute bottom-4 text-[11px] text-slate-600 font-medium tracking-wide">
            Maintained & Curated by <span className="text-purple-400 font-semibold">{STORE_CONFIG.OWNER_NAME}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
