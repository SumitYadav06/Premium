import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

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
  const [index, setIndex] = React.useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((prev) => (prev + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex((prev) => (prev - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 select-none"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-slate-400">
              Screenshot {index + 1} of {images.length}
            </span>
            <span className="text-[10px] bg-purple-600/30 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold">
              HD Quality
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Image Stage */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden py-4">
          {images.length > 1 && (
            <button
              onClick={() => setIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition active:scale-90"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <motion.img
            key={index}
            src={images[index]}
            alt={`Screenshot ${index + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
          />

          {images.length > 1 && (
            <button
              onClick={() => setIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition active:scale-90"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Thumbnail Strip */}
        <div className="flex justify-center gap-2 overflow-x-auto py-2 border-t border-white/10">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-14 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                index === i ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/40' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img} alt="thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
