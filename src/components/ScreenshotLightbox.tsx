import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface ScreenshotLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenshotLightbox: React.FC<ScreenshotLightboxProps> = ({
  images,
  initialIndex,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchCurrentXRef = useRef(0);
  const touchStartTimeRef = useRef(0);

  const touchStartDistRef = useRef<number>(0);
  const touchStartZoomRef = useRef<number>(1);
  const touchStartCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapTimeRef = useRef<number>(0);

  // Sync initial index and preload all screenshots immediately
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setDragOffset(0);
      setIsDragging(false);
      setIsTransitioning(false);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });

      // Preload images into browser memory cache for instantaneous switching
      images.forEach((src) => {
        if (src) {
          const img = new Image();
          img.src = src;
        }
      });
    }
  }, [initialIndex, isOpen, images]);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    touchStartDistRef.current = 0;
  }, []);

  const goToNext = useCallback(() => {
    if (images.length <= 1) return;
    handleResetZoom();
    setIsTransitioning(true);
    setDragOffset(0);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 200);
  }, [images.length, handleResetZoom]);

  const goToPrev = useCallback(() => {
    if (images.length <= 1) return;
    handleResetZoom();
    setIsTransitioning(true);
    setDragOffset(0);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 200);
  }, [images.length, handleResetZoom]);

  const goToIndex = (targetIdx: number) => {
    if (targetIdx === currentIndex) return;
    handleResetZoom();
    setIsTransitioning(true);
    setDragOffset(0);
    setCurrentIndex(targetIdx);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  // Keyboard & Android gesture back navigation for lightbox
  useEffect(() => {
    if (!isOpen) return;

    // Push state for lightbox when opened
    try {
      window.history.pushState({ lightbox: true }, '');
    } catch (e) {}

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, goToNext, goToPrev, onClose]);

  // Touch & Pinch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2-Finger Pinch start
      setIsDragging(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchStartDistRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartZoomRef.current = zoomLevel;
      touchStartPanRef.current = { ...panPosition };
      touchStartCenterRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTimeRef.current < 300) {
        // Double tap zoom
        if (zoomLevel > 1.05) {
          handleResetZoom();
        } else {
          setZoomLevel(2.2);
        }
        lastTapTimeRef.current = 0;
        return;
      }
      lastTapTimeRef.current = now;

      if (zoomLevel > 1) {
        // 1-finger pan when zoomed in
        setIsDragging(true);
        touchStartXRef.current = e.touches[0].clientX;
        touchStartYRef.current = e.touches[0].clientY;
        touchStartPanRef.current = { ...panPosition };
      } else {
        // 1-finger swipe to next/prev
        if (images.length <= 1) return;
        const touch = e.touches[0];
        touchStartXRef.current = touch.clientX;
        touchStartYRef.current = touch.clientY;
        touchCurrentXRef.current = touch.clientX;
        touchStartTimeRef.current = Date.now();
        setIsDragging(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2-Finger Pinch scale & translation
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

      if (touchStartDistRef.current > 0) {
        const factor = currentDist / touchStartDistRef.current;
        const newZoom = Math.min(Math.max(touchStartZoomRef.current * factor, 1), 4);
        setZoomLevel(newZoom);

        const currentCenter = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };
        const dx = currentCenter.x - touchStartCenterRef.current.x;
        const dy = currentCenter.y - touchStartCenterRef.current.y;
        setPanPosition({
          x: touchStartPanRef.current.x + dx,
          y: touchStartPanRef.current.y + dy
        });
      }
    } else if (e.touches.length === 1 && isDragging) {
      if (zoomLevel > 1) {
        const dx = e.touches[0].clientX - touchStartXRef.current;
        const dy = e.touches[0].clientY - touchStartYRef.current;
        setPanPosition({
          x: touchStartPanRef.current.x + dx,
          y: touchStartPanRef.current.y + dy
        });
      } else if (images.length > 1) {
        const touch = e.touches[0];
        const diffX = touch.clientX - touchStartXRef.current;
        const diffY = touch.clientY - touchStartYRef.current;

        if (Math.abs(diffX) > Math.abs(diffY)) {
          touchCurrentXRef.current = touch.clientX;
          setDragOffset(diffX * 0.75);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      touchStartDistRef.current = 0;

      if (zoomLevel <= 1.05) {
        handleResetZoom();
        if (images.length > 1) {
          const diffX = touchCurrentXRef.current - touchStartXRef.current;
          const timeTaken = Date.now() - touchStartTimeRef.current;
          const velocity = Math.abs(diffX) / Math.max(timeTaken, 1);

          if (diffX < -40 || (diffX < -15 && velocity > 0.3)) {
            goToNext();
          } else if (diffX > 40 || (diffX > 15 && velocity > 0.3)) {
            goToPrev();
          } else {
            setDragOffset(0);
          }
        }
      }
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      touchStartPanRef.current = { ...panPosition };
    }
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-5 select-none animate-fade-in"
      style={{ WebkitUserSelect: 'none' }}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-black text-slate-300 tracking-wider">
            Screenshot {currentIndex + 1} / {images.length}
          </span>
          <span className="text-[10px] bg-gradient-to-r from-purple-600/40 to-pink-600/40 text-purple-200 border border-purple-500/40 px-2.5 py-0.5 rounded-full font-black flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            <span>HD Preview</span>
          </span>
        </div>

        {/* Zoom Controls & Close Button */}
        <div className="flex items-center gap-2">
          {zoomLevel > 1 && (
            <button
              onClick={handleResetZoom}
              className="px-2.5 py-1 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-bold transition cursor-pointer"
            >
              Reset ({Math.round(zoomLevel * 100)}%)
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden py-3 touch-none select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Arrow */}
        {images.length > 1 && zoomLevel <= 1 && (
          <button
            onClick={goToPrev}
            className="absolute left-2 sm:left-6 z-30 p-3 rounded-full bg-black/60 hover:bg-purple-600 text-white border border-white/20 backdrop-blur-md transition hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
            aria-label="Previous Screenshot"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Display Current Image with 60fps Hardware-Accelerated Smooth Transition and Zoom/Pan */}
        <div
          className="w-full h-full flex items-center justify-center pointer-events-none"
          style={{
            transform: zoomLevel > 1
              ? `translate3d(${panPosition.x}px, ${panPosition.y}px, 0) scale(${zoomLevel})`
              : `translate3d(${dragOffset}px, 0, 0)`,
            transition: isDragging
              ? 'none'
              : 'transform 0.18s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.15s ease',
            transformOrigin: 'center center',
            opacity: isTransitioning ? 0.85 : 1,
            willChange: 'transform, opacity'
          }}
        >
          <img
            key={currentIndex}
            src={images[currentIndex] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"}
            alt={`Screenshot ${currentIndex + 1}`}
            decoding="async"
            loading="eager"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
            }}
            className="max-w-full max-h-[68vh] sm:max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10 select-none bg-slate-950"
            draggable={false}
          />
        </div>

        {/* Next Arrow */}
        {images.length > 1 && zoomLevel <= 1 && (
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-6 z-30 p-3 rounded-full bg-black/60 hover:bg-purple-600 text-white border border-white/20 backdrop-blur-md transition hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
            aria-label="Next Screenshot"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Swipe / Pinch Hint & Thumbnails */}
      <div className="flex flex-col items-center gap-2">
        {images.length > 1 && (
          <div className="flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-400">
            <ChevronLeft className="w-3 h-3 text-purple-400" />
            <span>Pinch with 2 fingers to Zoom • Double tap • Swipe to browse</span>
            <ChevronRight className="w-3 h-3 text-purple-400" />
          </div>
        )}

        {/* Thumbnails */}
        <div className="flex justify-center gap-2 overflow-x-auto py-1.5 max-w-full scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goToIndex(i)}
              className={`w-12 sm:w-14 h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                currentIndex === i
                  ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/50 opacity-100 ring-2 ring-purple-400/40'
                  : 'border-white/10 opacity-40 hover:opacity-90'
              }`}
            >
              <img
                src={img || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"}
                alt={`Thumb ${i + 1}`}
                className="w-full h-full object-cover"
                loading="eager"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
