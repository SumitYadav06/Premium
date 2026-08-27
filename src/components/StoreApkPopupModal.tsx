import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Smartphone,
  ShieldCheck,
  Zap,
  Sparkles,
  X,
  CheckCircle2,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { STORE_CONFIG } from '../config';

interface StoreApkPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const StoreApkPopupModal: React.FC<StoreApkPopupModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownloadApk = () => {
    const apkUrl =
      STORE_CONFIG.STORE_APP_APK_URL ||
      'https://github.com/SumitYadav06/Premium/releases/download/1.0.3/Premium.App.Store_1.0.apk';

    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'PremiumStore.apk';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadStarted(true);
    setTimeout(() => {
      setDownloadStarted(false);
    }, 5000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-md rounded-3xl p-5 sm:p-6 border shadow-2xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-slate-950/95 border-purple-800/50 text-white'
              : 'bg-white border-purple-200 text-slate-900'
          }`}
        >
          {/* Ambient Corner Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-pink-600/25 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition cursor-pointer z-10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header with App Mascot Logo (Official App Icon) */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="relative w-14 h-14 rounded-2xl p-0.5 rainbow-bg shadow-xl shadow-pink-500/25 flex-shrink-0 flex items-center justify-center">
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
                <h3 className="text-base sm:text-lg font-black tracking-tight rainbow-text">
                  {STORE_CONFIG.STORE_NAME} APK
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-2 py-0.5 rounded-full">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Fast Android Application Installer
              </p>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-4 text-center">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Version</p>
              <p className="text-xs font-black text-purple-300">v1.0.3</p>
            </div>
            <div className="border-x border-slate-800">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Size</p>
              <p className="text-xs font-black text-pink-400">4.8 MB</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Security</p>
              <p className="text-xs font-black text-emerald-400 flex items-center justify-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> 100% Safe
              </p>
            </div>
          </div>

          {/* Benefits Bullet Points */}
          <div className="space-y-2.5 mb-5 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Zap className="w-3 h-3" />
              </div>
              <p className="leading-tight">
                <strong className="text-white">1-Tap Direct Installs</strong>: Instant background download without browser redirects.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3 h-3" />
              </div>
              <p className="leading-tight">
                <strong className="text-white">VIP Daily Updates</strong>: Get latest modded APKs and unlocked VIP features first.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-3 h-3" />
              </div>
              <p className="leading-tight">
                <strong className="text-white">Offline Access</strong>: Manage your downloaded packages right inside the app.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {downloadStarted ? (
              <div className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30">
                <CheckCircle2 className="w-5 h-5 animate-pulse" />
                <span>APK Downloading Started! Check Notifications</span>
              </div>
            ) : (
              <button
                onClick={handleDownloadApk}
                className="w-full py-3.5 px-5 rounded-2xl font-black uppercase text-xs sm:text-sm tracking-wider text-white bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-400 hover:via-rose-500 hover:to-purple-500 shadow-xl shadow-pink-600/30 active:scale-98 transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Download className="w-4 h-4 group-hover:animate-bounce" />
                <span>Download Store APK Now</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 text-center text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Continue using Web Version
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
