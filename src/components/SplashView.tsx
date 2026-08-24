import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '../config';

interface SplashViewProps {
  logoUrl?: string;
  onFinish?: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({
  logoUrl = STORE_CONFIG.STORE_SPLASH_LOGO
}) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#030712] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
    >
      {/* Ambient background glow circles */}
      <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none -top-20 -left-20 animate-pulse" />
      <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20 animate-pulse" />

      {/* Main Container */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex flex-col items-center text-center z-10"
      >
        {/* Logo with Glowing Border */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[2.25rem] blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-[2rem] overflow-hidden bg-slate-900 border-2 border-purple-500/40 shadow-2xl p-1.5 flex items-center justify-center">
            <img
              src={logoUrl || STORE_CONFIG.STORE_SPLASH_LOGO || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"}
              alt={STORE_CONFIG.STORE_NAME}
              className="w-full h-full object-cover rounded-[1.65rem]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80";
              }}
            />
          </div>
          
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white/20">
            <Sparkles className="w-3 h-3" /> VIP
          </div>
        </div>

        {/* Title with Aurora Text */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-black italic tracking-tight mb-2 rainbow-text drop-shadow"
        >
          {STORE_CONFIG.STORE_NAME}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-slate-400 flex items-center gap-2 mb-8"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Curated Verified Applications</span>
        </motion.p>

        {/* High-tech Loading Progress */}
        <div className="w-48 sm:w-56 bg-slate-900/80 border border-slate-800 rounded-full h-2 overflow-hidden p-0.5 shadow-inner">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
          />
        </div>

        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-3 font-mono">
          Starting Security Engine...
        </span>
      </motion.div>

      {/* Footer Brand */}
      <div className="absolute bottom-6 text-[11px] text-slate-600 font-medium tracking-wide">
        Developed & Maintained by <span className="text-purple-400 font-semibold">SMSUMIT</span>
      </div>
    </motion.div>
  );
};
