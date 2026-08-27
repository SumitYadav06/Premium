import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

interface GuideItem {
  id: number;
  title: string;
  stepName: string;
  subtitle: string;
  instruction: string;
  sources: string[];
}

const GUIDE_ITEMS: GuideItem[] = [
  {
    id: 1,
    title: "Play Protect",
    stepName: "Step 1",
    subtitle: "Open Play Store Settings",
    instruction: "Open Google Play Store > Tap your Profile Icon at top right > Tap Play Protect > Tap the Settings Gear icon ⚙️ at top right.",
    sources: [
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/public/guide/Playstre%20setting.png",
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/guide/Playstre%20setting.png",
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/Playstre%20setting.png",
      "/guide/Playstre setting.png"
    ]
  },
  {
    id: 2,
    title: "Disable Scan",
    stepName: "Step 2",
    subtitle: "Turn Off Scanning",
    instruction: "Turn OFF 'Scan apps with Play Protect' and 'Improve harmful app detection' to prevent false positive blocks on mod APKs.",
    sources: [
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/public/guide/Google-Play-Protect-Settings.png",
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/guide/Google-Play-Protect-Settings.png",
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/Google-Play-Protect-Settings.png",
      "/guide/Google-Play-Protect-Settings.png"
    ]
  },
  {
    id: 3,
    title: "Chrome Settings",
    stepName: "Step 3",
    subtitle: "Privacy & Security",
    instruction: "Open Chrome Settings > Go to 'Privacy and security' > Tap on 'Safe Browsing' settings.",
    sources: [
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/public/guide/Chromesetting.png",
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/guide/Chromesetting.png",
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/Chromesetting.png",
      "/guide/Chromesetting.png"
    ]
  },
  {
    id: 4,
    title: "Chrome Fix",
    stepName: "Step 4",
    subtitle: "Standard Protection",
    instruction: "Select 'Standard protection' or 'No protection' so Chrome does not block downloaded APK files.",
    sources: [
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/public/guide/Chrome-Security-Protection-Settings.png",
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/guide/Chrome-Security-Protection-Settings.png",
      "https://raw.githubusercontent.com/SumitYadav06/Premium/main/Chrome-Security-Protection-Settings.png",
      "/guide/Chrome-Security-Protection-Settings.png"
    ]
  }
];

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [resolvedSources, setResolvedSources] = useState<Record<number, string>>({});

  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentItem = GUIDE_ITEMS[activeTab];

  // Preload all guide images
  useEffect(() => {
    if (isOpen) {
      GUIDE_ITEMS.forEach((item) => {
        const img = new Image();
        img.src = item.sources[0];
      });
    }
  }, [isOpen]);

  // Reset zoom & pan when switching tabs or closing zoom
  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    handleResetZoom();
  }, [activeTab, isZoomOpen, handleResetZoom]);

  // Handle fallback source if an image fails to load
  const handleImageError = (index: number, currentSrc: string) => {
    const item = GUIDE_ITEMS[index];
    if (!item) return;
    const currentSrcIndex = item.sources.indexOf(currentSrc);
    if (currentSrcIndex !== -1 && currentSrcIndex < item.sources.length - 1) {
      const nextSrc = item.sources[currentSrcIndex + 1];
      setResolvedSources((prev) => ({ ...prev, [index]: nextSrc }));
    }
  };

  const getImageSrc = (index: number) => {
    return resolvedSources[index] || GUIDE_ITEMS[index].sources[0];
  };

  // Zoom In / Out Controls
  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleToggleZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (zoomLevel > 1) {
      handleResetZoom();
    } else {
      setZoomLevel(2);
    }
  };

  // Pan / Drag handlers when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
    initialPanRef.current = { ...panPosition };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoomLevel <= 1) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPanPosition({
      x: initialPanRef.current.x + dx,
      y: initialPanRef.current.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch Drag / Pan handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsPanning(true);
    panStartRef.current = { x: touch.clientX, y: touch.clientY };
    initialPanRef.current = { ...panPosition };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || zoomLevel <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - panStartRef.current.x;
    const dy = touch.clientY - panStartRef.current.y;
    setPanPosition({
      x: initialPanRef.current.x + dx,
      y: initialPanRef.current.y + dy
    });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Keyboard navigation when zoom lightbox is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (isZoomOpen) {
          setIsZoomOpen(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowRight') {
        setActiveTab((prev) => (prev + 1) % GUIDE_ITEMS.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveTab((prev) => (prev - 1 + GUIDE_ITEMS.length) % GUIDE_ITEMS.length);
      }
      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      }
      if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isZoomOpen, onClose]);

  if (!isOpen) return null;

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
          className="relative w-full max-w-xl rounded-3xl p-4 sm:p-6 border border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white shadow-2xl shadow-purple-950/70 overflow-hidden z-10 max-h-[94vh] flex flex-col"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0 shadow-inner">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </span>
              <div>
                <h2 className="text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-200">
                  APK Installation Guide
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Fix "App Not Installed" & Play Protect Warnings
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Step Tabs */}
          <div className="grid grid-cols-4 gap-1.5 py-3 border-b border-slate-800/80 flex-shrink-0">
            {GUIDE_ITEMS.map((item, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(idx)}
                  className={`py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer border text-center relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-900/90 via-pink-950/80 to-purple-900/90 border-purple-400 shadow-md shadow-purple-500/30'
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className={`block text-[11px] font-black ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                    {item.stepName}
                  </span>
                  <span className="block text-[9px] font-medium text-slate-400 truncate">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Instruction Box */}
          <div className="mt-2.5 px-3.5 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex items-start gap-2 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] sm:text-xs">
              <strong className="text-white font-bold">{currentItem.subtitle}: </strong>
              {currentItem.instruction}
            </p>
          </div>

          {/* Main Visual Image View with Interactive Fullscreen/Zoom trigger */}
          <div className="flex-1 flex flex-col items-center justify-center py-2.5 overflow-hidden min-h-[260px] sm:min-h-[300px]">
            <div className="w-full flex items-center justify-between px-1 mb-1.5 text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1">
                <span className="text-purple-400 font-mono">[{activeTab + 1}/4]</span> {currentItem.subtitle}
              </span>
              <button
                onClick={() => setIsZoomOpen(true)}
                className="text-[11px] text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition active:scale-95 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Tap to Zoom Fullscreen
              </button>
            </div>

            {/* Clickable Image Container */}
            <div
              onClick={() => setIsZoomOpen(true)}
              className="relative w-full flex-1 max-h-[50vh] flex items-center justify-center rounded-2xl overflow-hidden bg-slate-950/90 border border-purple-500/40 p-2 cursor-zoom-in group shadow-2xl hover:border-amber-400/80 transition-all duration-300"
            >
              <img
                src={getImageSrc(activeTab)}
                alt={currentItem.title}
                onError={() => handleImageError(activeTab, getImageSrc(activeTab))}
                className="max-h-[46vh] w-auto max-w-full object-contain rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
              />

              {/* Hover/Tap Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white backdrop-blur-[2px]">
                <div className="p-3 rounded-full bg-purple-600/90 border border-white/30 shadow-xl scale-95 group-hover:scale-110 transition-transform">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase bg-black/60 px-3 py-1 rounded-full border border-white/20">
                  Click / Tap to Zoom Fullscreen
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab((p) => (p > 0 ? p - 1 : GUIDE_ITEMS.length - 1))}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-1.5">
              {GUIDE_ITEMS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeTab === i ? 'bg-amber-400 w-5' : 'bg-slate-700 hover:bg-slate-600 w-2'
                  }`}
                  title={`Step ${i + 1}`}
                />
              ))}
            </div>

            {activeTab < GUIDE_ITEMS.length - 1 ? (
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

        {/* FULLSCREEN MULTI-LEVEL ZOOM & PAN LIGHTBOX MODAL */}
        <AnimatePresence>
          {isZoomOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-2 sm:p-4 select-none touch-none"
              onClick={() => {
                if (zoomLevel === 1) setIsZoomOpen(false);
              }}
            >
              {/* Top Zoom Control Toolbar */}
              <div
                className="flex items-center justify-between text-white pb-3 pt-1 border-b border-white/10 px-2 relative z-20 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-black text-amber-300 tracking-wider font-mono">
                    Step {activeTab + 1} / {GUIDE_ITEMS.length}
                  </span>
                  <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                    • {currentItem.subtitle}
                  </span>
                </div>

                {/* Interactive Zoom Toolbar */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-slate-700/80 px-2 py-1 rounded-2xl shadow-xl">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleToggleZoom}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-amber-300 text-xs font-black font-mono hover:bg-slate-700 transition cursor-pointer"
                    title="Double Tap / Toggle Zoom"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </button>

                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3.5}
                    className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  {zoomLevel > 1 && (
                    <button
                      onClick={handleResetZoom}
                      className="p-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/80 text-purple-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Close Fullscreen Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomOpen(false);
                  }}
                  className="p-2 rounded-full bg-slate-800/90 hover:bg-rose-600 text-white transition active:scale-95 cursor-pointer shadow-lg"
                  title="Close Fullscreen (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Central Zoomable & Pannable Viewport */}
              <div
                className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDoubleClick={handleToggleZoom}
              >
                {/* Left Navigation Arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab((p) => (p > 0 ? p - 1 : GUIDE_ITEMS.length - 1));
                  }}
                  className="absolute left-2 sm:left-4 z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-purple-600 text-white border border-white/20 shadow-2xl transition active:scale-90 cursor-pointer"
                  title="Previous Step (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Zoomable Image Container */}
                <div
                  style={{
                    transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                    transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                    transformOrigin: 'center center'
                  }}
                  className="relative max-w-full max-h-full flex items-center justify-center pointer-events-auto"
                >
                  <img
                    src={getImageSrc(activeTab)}
                    alt={currentItem.title}
                    onError={() => handleImageError(activeTab, getImageSrc(activeTab))}
                    className="max-h-[82vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl border border-purple-500/40 select-none pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Right Navigation Arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab((p) => (p + 1) % GUIDE_ITEMS.length);
                  }}
                  className="absolute right-2 sm:right-4 z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-purple-600 text-white border border-white/20 shadow-2xl transition active:scale-90 cursor-pointer"
                  title="Next Step (Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Bottom Thumbnails & Pan Help */}
              <div
                className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-white/10 px-2 relative z-20 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag / Pan Hint */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Move className="w-3.5 h-3.5 text-purple-400" />
                  <span>Double tap to Zoom | Drag to pan when zoomed</span>
                </div>

                {/* 4 Bottom Step Dots / Thumbnails */}
                <div className="flex items-center gap-1.5">
                  {GUIDE_ITEMS.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === idx
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-pink-500/40 scale-105'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {item.stepName}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
