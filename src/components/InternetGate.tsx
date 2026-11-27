// INTERNET GATE — full-screen blocker jab mobile data / Wi-Fi OFF ho.
// Store tabhi chalega jab internet ON ho: apps dekhne aur download
// karne ke liye net chahiye hi. Sirf navigator.onLine par gate karta
// hai — koi fetch/ping test nahi (data ON par recharge na ho to bhi
// store khulta hai, bilkul games wale gate jaisa).
// ForceUpdateBlocker se upar: App.tsx me offline hone par ye pehle
// render hota hai, online hote hi khud gayab ho jata hai.
import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { STORE_CONFIG } from '../config';

export const InternetGate: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <div
      role="alertdialog"
      aria-label="Internet on karo"
      className="fixed inset-0 z-[100000] min-h-screen bg-[#0d0a1a] text-white flex flex-col items-center justify-center px-6 py-10 text-center select-none overflow-y-auto"
    >
      {/* Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-amber-500/25 blur-3xl" aria-hidden="true" />

      <img
        src={STORE_CONFIG.STORE_APP_ICON}
        alt={STORE_CONFIG.STORE_NAME}
        className="relative w-20 h-20 rounded-[22px] object-cover border-2 border-amber-400/60 shadow-2xl shadow-amber-500/30 mb-5"
      />

      <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-widest mb-4">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Internet Band Hai</span>
      </div>

      <h1 className="relative font-display font-black text-2xl leading-tight">
        Internet on karo
      </h1>

      <p className="relative text-sm text-slate-300 mt-4 max-w-sm leading-relaxed">
        Apps download karne ke liye mobile data ya Wi-Fi ON hona chahiye.
        Internet band hai to store nahi chalega — pehle internet on karo,
        phir store khul jayega.
      </p>
      <p className="relative text-xs text-slate-500 mt-2 max-w-sm">
        Turn on mobile data or Wi-Fi to browse and download apps.
      </p>

      <button
        onClick={onRetry}
        className="relative mt-7 w-full max-w-xs flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-600 hover:from-amber-400 hover:via-amber-500 hover:to-amber-500 text-white font-black text-base tracking-wide shadow-2xl shadow-amber-600/40 active:scale-95 transition cursor-pointer border border-white/25"
      >
        <RefreshCw className="w-5 h-5" />
        <span>Dobara check karo</span>
      </button>

      <p className="relative mt-6 text-[11px] text-slate-500">
        Internet on hote hi ye screen apne aap hat jayegi.
      </p>
    </div>
  );
};
