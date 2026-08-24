import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface ScreenshotLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 250 : -250,
    opacity: 0,
    scale: 0.96
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 250 : -250,
    opacity: 0,
    scale: 0.96
  })
};

export const ScreenshotLightbox: React.FC<ScreenshotLightboxProps> = ({
  images,
  initialIndex,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Sync initial index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setDirection(0);
    }
  }, [initialIndex, isOpen]);

  const goToNext = () => {
    if (images.length <= 1 || isSwiping) return;
    setIsSwiping(true);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsSwiping(false), 320);
  };

  const goToPrev = () => {
    if (images.length <= 1 || isSwiping) return;
    setIsSwiping(true);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsSwiping(false), 320);
  };

  const goToIndex = (targetIdx: number) => {
    if (targetIdx === currentIndex || isSwiping) return;
    setIsSwiping(true);
    setDirection(targetIdx > currentIndex ? 1 : -1);
    setCurrentIndex(targetIdx);
    setTimeout(() => setIsSwiping(false), 320);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, currentIndex, isSwiping]);

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-5 select-none"
      >
        {/* Header Bar */}
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

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Image Stage with Ultra-Smooth Single-Image Gesture Drag */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden py-3">
          {/* Previous Arrow Button */}
          {images.length > 1 && (
            <button
              onClick={goToPrev}
              className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-black/60 hover:bg-purple-600 text-white border border-white/20 backdrop-blur-md transition active:scale-90 shadow-2xl cursor-pointer"
              aria-label="Previous Screenshot"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Single Draggable & Animated Screenshot */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 260, damping: 28 },
                opacity: { duration: 0.25 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, { offset, velocity }) => {
                const threshold = 40;
                if (offset.x < -threshold || velocity.x < -200) {
                  goToNext(); // Single next screenshot
                } else if (offset.x > threshold || velocity.x > 200) {
                  goToPrev(); // Single prev screenshot
                }
              }}
              className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
            >
              <img
                src={images[currentIndex]}
                alt={`Screenshot ${currentIndex + 1}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
                }}
                className="max-w-full max-h-[68vh] sm:max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10 pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>

          {/* Next Arrow Button */}
          {images.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-black/60 hover:bg-purple-600 text-white border border-white/20 backdrop-blur-md transition active:scale-90 shadow-2xl cursor-pointer"
              aria-label="Next Screenshot"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Swipe Hint & Thumbnails */}
        <div className="flex flex-col items-center gap-2">
          {images.length > 1 && (
            <div className="flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-400">
              <ChevronLeft className="w-3 h-3 text-purple-400 animate-pulse" />
              <span>Swipe left or right (1 by 1)</span>
              <ChevronRight className="w-3 h-3 text-purple-400 animate-pulse" />
            </div>
          )}

          {/* Thumbnail Strip */}
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
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

