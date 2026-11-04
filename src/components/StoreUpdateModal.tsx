import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Download, X, AlertTriangle } from 'lucide-react';
import { STORE_CONFIG } from '../config';
import { getDownloadMode } from '../services/nativeDownload';

/**
 * Purane store APK (jisme in-app download wala plugin nahi hai) ke users ko
 * app khulte hi update ka popup dikhata hai. Naya APK lagte hi mode 'native'
 * ho jayega aur ye popup apne aap hamesha ke liye band ho jayega.
 * Website (browser) par ye kabhi nahi dikhta — wahan banner kaafi hai.
 */
export const StoreUpdateModal: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        setVisible(getDownloadMode() === 'old-apk');
      } catch {
        setVisible(false);
      }
    };
    const t = setTimeout(check, 1200);
    const onVis = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearTimeout(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  if (!visible) return null;

  const handleUpdate = () => {
    window.open(STORE_CONFIG.STORE_APP_APK_URL, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 text-white rounded-3xl p-6 shadow-2xl overflow-hidden"
      >
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 relative">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h4 className="font-black text-xl text-white">App Purana Hai — Update Karo</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            Ye purana app hai. Ek baar <strong className="text-white">naya app</strong> laga lo —
            phir har download aur install <strong className="text-white">isi app ke andar</strong> hoga.
          </p>
        </div>

        <button
          onClick={handleUpdate}
          className="btn-live dl-live relative w-full mt-5 py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider text-white bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 shadow-lg shadow-fuchsia-600/30 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Update Download Karo</span>
        </button>

        <div className="relative mt-4 bg-slate-800/70 border border-slate-700/60 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Agar <strong className="text-white">"App not installed"</strong> aaye to pehle purana app
            uninstall karke phir download ki hui file install karo. Koi data nahi jayega —
            ye app sirf store ki website kholta hai.
          </p>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="relative w-full mt-3 py-2 text-xs text-slate-400 hover:text-white font-medium transition text-center cursor-pointer"
        >
          Baad Me — abhi purana app chalao
        </button>
      </motion.div>
    </div>
  );
};
