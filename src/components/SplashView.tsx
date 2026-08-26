import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '../config';

interface SplashViewProps {
  onFinish: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onFinish }) => {
  const [logoUrl, setLogoUrl] = useState<string>(STORE_CONFIG.STORE_SPLASH_LOGO);

  useEffect(() => {
    const saved = localStorage.getItem('store_splash_logo');
    if (saved) {
      setLogoUrl(saved);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none">
      {/* Dynamic Background Aurora Lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/25 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex flex-col items-center text-center z-10"
      >
        {/* Logo with Glowing Border */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[2.25rem] blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-[2rem] overflow-hidden bg-slate-900 border-2 border-purple-500/40 shadow-2xl p-1.5 flex items-center justify-center">
            <img
              src={logoUrl || STORE_CONFIG.STORE_SPLASH_LOGO || "https://i.ibb.co/HffVtwhY/image.jpg"}
              alt={STORE_CONFIG.STORE_NAME}
              className="w-full h-full object-cover rounded-[1.65rem]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://i.ibb.co/HffVtwhY/image.jpg";
              }}
            />
          </div>
          
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-xl shadow-amber-500/30 flex items-center gap-1 border border-amber-200/90 ring-2 ring-slate-950/60">
            <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" /> VIP
          </div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-white"
        >
          {STORE_CONFIG.STORE_NAME}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-xs sm:text-sm text-purple-300/80 font-medium tracking-wide mt-1.5 max-w-xs"
        >
          {STORE_CONFIG.STORE_TAGLINE}
        </motion.p>

        {/* Enter Store Button */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={onFinish}
          className="mt-8 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-purple-600/40 hover:shadow-purple-600/60 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2"
        >
          <span>Enter Store</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
