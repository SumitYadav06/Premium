import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  if (!isOpen) return null;

  const guideImages = [
    {
      title: "Play Protect 1",
      subtitle: "Play Store Settings",
      image: "/guide/Playstre setting.png",
      fallback: "https://raw.githubusercontent.com/SumitYadav06/Premium/main/public/guide/Playstre%20setting.png"
    },
    {
      title: "Play Protect 2",
      subtitle: "Turn Off Scanning",
      image: "/guide/Google-Play-Protect-Settings.png",
      fallback: "https://raw.githubusercontent.com/SumitYadav06/Premium/main/public/guide/Google-Play-Protect-Settings.png"
    },
    {
      title: "Chrome Fix 1",
      subtitle: "Privacy & Security",
      image: "/guide/Chromesetting.png",
      fallback: "https://raw.githubusercontent.com/SumitYadav06/Premium/main/public/guide/Chromesetting.png"
    },
    {
      title: "Chrome Fix 2",
      subtitle: "Standard Protection",
      image: "/guide/Chrome-Security-Protection-Settings.png",
      fallback: "https://raw.githubusercontent.com/SumitYadav06/Premium/main/public/guide/Chrome-Security-Protection-Settings.png"
    }
  ];

  const currentItem = guideImages[activeTab];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl p-4 sm:p-6 border border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white shadow-2xl shadow-purple-950/70 overflow-hidden z-10 max-h-[94vh] flex flex-col"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </span>
              <div>
                <h2 className="text-base font-black tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-white">
                  Installation Guide
                </h2>
                <p className="text-[11px] text-slate-400">
                  Slide through all 4 settings screenshots
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Tabs / Thumbnails */}
          <div className="grid grid-cols-4 gap-1.5 py-3 border-b border-slate-800/80 flex-shrink-0">
            {guideImages.map((item, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer border text-center ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-purple-400 shadow-md shadow-purple-500/30'
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/60 opacity-60 hover:opacity-90'
                  }`}
                >
                  <span className="block text-[11px] font-black text-white leading-tight">
                    {idx + 1}
                  </span>
                  <span className="block text-[9px] font-medium text-slate-400 truncate">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Visual Image View (Pure Screenshots) */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 overflow-hidden min-h-[300px]">
            <div className="w-full flex items-center justify-between px-1 mb-1.5 text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1">
                <span className="text-purple-400 font-mono">[{activeTab + 1}/4]</span> {currentItem.subtitle}
              </span>
              <span className="text-[10px] text-purple-400 flex items-center gap-1">
                <Maximize2 className="w-3 h-3" /> Tap image to zoom
              </span>
            </div>

            <div
              onClick={() => setPreviewImg(currentItem.image)}
              className="relative w-full flex-1 max-h-[56vh] flex items-center justify-center rounded-2xl overflow-hidden bg-slate-950/80 border border-purple-500/30 p-1 cursor-pointer group shadow-xl hover:border-purple-500 transition"
            >
              <img
                src={currentItem.image}
                alt={currentItem.title}
                onError={(e) => {
                  if (currentItem.fallback) {
                    (e.target as HTMLImageElement).src = currentItem.fallback;
                  }
                }}
                className="max-h-[52vh] w-auto max-w-full object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-bold text-white backdrop-blur-[2px]">
                <Maximize2 className="w-4 h-4" />
                <span>Tap to Fullscreen</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab((p) => (p > 0 ? p - 1 : guideImages.length - 1))}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-1">
              {guideImages.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeTab === i ? 'bg-purple-400 w-4' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {activeTab < guideImages.length - 1 ? (
              <button
                onClick={() => setActiveTab((p) => p + 1)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/30 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Done</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Full Image Zoom Modal */}
        {previewImg && (
          <div
            onClick={() => setPreviewImg(null)}
            className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 cursor-zoom-out"
          >
            <div className="relative max-w-full max-h-[92vh]">
              <img
                src={previewImg}
                alt="Guide Screenshot Full"
                className="max-w-full max-h-[90vh] object-contain rounded-2xl border border-purple-500/40 shadow-2xl"
              />
              <button
                onClick={() => setPreviewImg(null)}
                className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-slate-800 rounded-full text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
