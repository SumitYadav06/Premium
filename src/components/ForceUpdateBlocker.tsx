// FULL-SCREEN update blocker — sirf purane 5 MB APK ke liye.
// Poora store chhupa deta hai: na close button, na bypass. User ko
// naya APK download karna hi padega, tabhi store khulega.
// Naye APK, browser ya uncertain bridge par ye kabhi render nahi hota
// (App.tsx me forceUpdateBlocked sirf confirm hone par true hota hai).
import React from 'react';
import { Download, AlertTriangle, ShieldCheck } from 'lucide-react';
import { STORE_CONFIG } from '../config';
import { FORCE_UPDATE_APK_URL } from '../utils/forceUpdate';

export const ForceUpdateBlocker: React.FC = () => {
  const openDownload = () => {
    // Wahi pattern jo StoreUpdateModal / DirectInstallerModal use karte
    // hain — purane APK shell me bhi yahi se download shuru hota hai.
    window.open(FORCE_UPDATE_APK_URL, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen bg-[#0d0a1a] text-white flex flex-col items-center justify-center px-6 py-10 text-center select-none overflow-y-auto">
      {/* Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-amber-500/25 blur-3xl" aria-hidden="true" />

      <img
        src={STORE_CONFIG.STORE_APP_ICON}
        alt={STORE_CONFIG.STORE_NAME}
        className="relative w-20 h-20 rounded-[22px] object-cover border-2 border-amber-400/60 shadow-2xl shadow-amber-500/30 mb-5"
      />

      <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 text-[11px] font-black uppercase tracking-widest mb-4">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Old Version • Purana Version</span>
      </div>

      <h1 className="relative font-display font-black text-2xl leading-tight">
        Naya Version Aaya Hai!
        <span className="block text-amber-400 mt-1">Update Karo — New Version Download Karo</span>
      </h1>

      <p className="relative text-sm text-slate-300 mt-4 max-w-sm leading-relaxed">
        Aap purana app use kar rahe ho. Isme naye apps, naye features aur ads
        nahi milenge. Aage badhne ke liye naya version download karo — ye
        free hai.
      </p>

      {/* Pehli baar seedha install nahi hoga — purane APK ka certificate
          alag hai, isliye Android update rok dega. Ek baar purana app
          uninstall karke naya install karna padega; uske baad har update
          seedha install hoga, bina uninstall ke. */}
      <ol className="relative mt-5 w-full max-w-xs space-y-2.5 text-left">
        <li className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 px-3.5 py-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">1</span>
          <span className="text-sm text-slate-200 leading-snug">Naya APK download karo — neeche wala button dabao</span>
        </li>
        <li className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 px-3.5 py-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">2</span>
          <span className="text-sm text-slate-200 leading-snug">Purana app ek baar uninstall karo, phir download kiya hua naya APK install karo</span>
        </li>
      </ol>

      <p className="relative text-xs text-amber-200/90 mt-4 max-w-sm leading-relaxed">
        Ek baar naya version install ho gaya to uske baad har update seedha
        install hoga — dobara uninstall nahi karna padega.
      </p>
      <p className="relative text-xs text-slate-500 mt-2 max-w-sm">
        You are using the old version. Download the new APK, uninstall the old
        app once, then install the new one. After this one-time step, all
        future updates will install directly.
      </p>

      <button
        onClick={openDownload}
        className="relative mt-7 w-full max-w-xs flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-600 hover:from-amber-400 hover:via-amber-500 hover:to-amber-500 text-white font-black text-base tracking-wide shadow-2xl shadow-amber-600/40 active:scale-95 transition cursor-pointer border border-white/25"
      >
        <Download className="w-5 h-5" />
        <span>Update Karo — Download Naya APK</span>
      </button>

      {/* Fallback link — agar button se download na khule to */}
      <a
        href={FORCE_UPDATE_APK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-4 text-xs font-bold text-amber-300 underline underline-offset-4"
      >
        Link nahi khul raha? Yahan tap karo
      </a>

      <p className="relative mt-6 flex items-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        100% Safe • Official Apna Jugaad APK • {STORE_CONFIG.OWNER_NAME}
      </p>
    </div>
  );
};
