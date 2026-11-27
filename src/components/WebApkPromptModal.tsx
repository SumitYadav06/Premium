import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, ShieldCheck, X, CheckCircle2 } from 'lucide-react';
import { STORE_CONFIG } from '../config';

interface WebApkPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

/**
 * WEB APK PROMPT (2026-11-27) — website = catalogue, downloads SIRF APK ke andar.
 *
 * Sirf tab khulta hai jab ek WEB visitor kisi app ka Download dabata hai.
 * APK shell ke andar kabhi nahi khulta (gate App.tsx me hai), page load par
 * kabhi nahi khulta, aur koi browser download shuru nahi karta — bada button
 * sirf store APK ka link hai. "Baad me / Later" se band ho jata hai.
 */
export const WebApkPromptModal: React.FC<WebApkPromptModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="APK download karo"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-md rounded-3xl p-5 sm:p-6 border shadow-2xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-slate-950/95 border-fuchsia-800/50 text-white'
              : 'bg-white border-fuchsia-200 text-slate-900'
          }`}
        >
          {/* Ambient Corner Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-fuchsia-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-violet-600/25 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header with Store Icon */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="relative w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-orange-400 shadow-lg shadow-fuchsia-500/30 flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-1 overflow-hidden">
                <img
                  src={STORE_CONFIG.STORE_APP_ICON}
                  alt={STORE_CONFIG.STORE_NAME}
                  className="w-full h-full object-cover rounded-[10px]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('raw.githubusercontent.com')) {
                      target.src = "https://raw.githubusercontent.com/SumitYadav06/Premium/main/app-icon.png";
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {STORE_CONFIG.STORE_NAME}
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-2 py-0.5 rounded-full">
                  Official
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Store
                </span>
              </p>
            </div>
          </div>

          {/* Headline + Subtext (Hindi + English) */}
          <div className="text-center space-y-2 mb-5">
            <div className="w-12 h-12 rounded-full bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center mx-auto border border-fuchsia-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <h4 className="font-black text-xl sm:text-2xl leading-tight">
              APK download karo
            </h4>
            <p className="text-sm font-semibold text-slate-200 leading-relaxed">
              Ek tap me install karo, phir saare apps free me download karo
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download the APK in one tap, then download all apps free inside the app.
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Website par sirf browse karo — downloads sirf app ke andar hote hain.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <a
              href={STORE_CONFIG.STORE_APP_APK_URL}
              download="Apna.Jugaad.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 rounded-2xl font-black uppercase text-xs sm:text-sm tracking-wider text-white bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 hover:from-violet-500 hover:to-orange-300 shadow-xl shadow-fuchsia-600/30 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>APK Download Karo</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-center text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Baad me / Later
            </button>
          </div>

          {/* Trust note */}
          <p className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400/90 font-semibold mt-4">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Free • No login • Saare apps unlocked</span>
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
