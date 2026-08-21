import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Settings
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className={`relative w-full max-w-lg rounded-[2.5rem] p-6 sm:p-7 border shadow-2xl overflow-hidden z-10 max-h-[90vh] overflow-y-auto ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-xl transition ${
              theme === 'dark'
                ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                How to Install APKs <Sparkles className="w-4 h-4 text-yellow-400" />
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Simple 3-step beginner guide for Android phones
              </p>
            </div>
          </div>

          {/* 3 Step Visual Sequence */}
          <div className="space-y-4 mb-6">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/30 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-300 mb-1 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Download the APK Package</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click the <strong>Direct Download</strong> button on any app. The high-speed APK file will download directly to your Android device via browser.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/30 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-300 mb-1 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-blue-400" />
                  <span>Enable "Install Unknown Apps"</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If prompted by your phone: Go to <em>Settings → Apps → Special app access → Install unknown apps</em> and allow permission for Chrome or your file manager.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tap Install & Enjoy VIP Features</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Open the downloaded file from your notification panel or Downloads folder, tap <strong>Install</strong>, and launch your unlocked app!
                </p>
              </div>
            </div>
          </div>

          {/* Security Box */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 mb-5">
            <div className="flex items-center gap-2 mb-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> 100% Virus-Free Guarantee
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every single APK in this store is scanned through Google Play Protect and VirusTotal multi-engine definitions before being published. No root required.
            </p>
          </div>

          {/* Done Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <span>Got It, Start Downloading</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
