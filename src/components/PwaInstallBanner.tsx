import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, X, Smartphone, CheckCircle2 } from 'lucide-react';

interface PwaInstallBannerProps {
  theme: 'dark' | 'light';
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ theme }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalledSuccess(true);
        setTimeout(() => setIsDismissed(true), 3000);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback guide for Android Chrome / iOS Safari
      alert('To install: Tap your browser menu (⋮ or Share) and select "Add to Home Screen" or "Install App".');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    } catch {}
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className={`relative rounded-3xl p-4 sm:p-5 border shadow-xl overflow-hidden mb-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-indigo-950/80 border-purple-800/40 text-white'
            : 'bg-gradient-to-r from-purple-50 via-white to-blue-50 border-purple-200 text-slate-900 shadow-purple-500/5'
        }`}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-blue-600 p-0.5 shadow-lg shadow-purple-600/30 flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-400">
                <Smartphone className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-black tracking-tight">Install Premium Store App</h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-purple-500 text-white px-2 py-0.5 rounded-full">
                  1-Tap APK Access
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium max-w-md">
                Add Premium Store to your phone screen for offline catalog browsing and instant VIP downloads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {installedSuccess ? (
              <div className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Added to Home Screen!
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-purple-600/25 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Install Store App</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
