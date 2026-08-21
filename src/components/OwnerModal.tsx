import React from 'react';
import { motion } from 'motion/react';
import {
  Youtube,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Users,
  CheckCircle,
  X,
  Heart
} from 'lucide-react';

interface OwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerImg?: string;
  youtubeLink?: string;
  theme: 'dark' | 'light';
}

export const OwnerModal: React.FC<OwnerModalProps> = ({
  isOpen,
  onClose,
  ownerImg = "https://i.ibb.co/HffVtwhY/image.jpg",
  youtubeLink = "https://youtube.com/@smsumit06",
  theme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[8600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        className={`relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border overflow-hidden select-none ${
          theme === 'dark'
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Glow behind avatar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className="relative mx-auto w-24 h-24 mb-4">
          <div className="absolute -inset-1 bg-gradient-to-tr from-purple-600 via-pink-600 to-red-600 rounded-full blur-md opacity-80 animate-pulse" />
          <img
            src={ownerImg}
            alt="SMSUMIT"
            className="relative w-full h-full rounded-full object-cover border-2 border-white shadow-2xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80";
            }}
          />
          <div className="absolute bottom-0 right-0 bg-red-600 text-white p-1 rounded-full border-2 border-slate-950 shadow">
            <Youtube className="w-3.5 h-3.5" />
          </div>
        </div>

        <h3 className="font-black text-xl flex items-center justify-center gap-1.5 leading-tight">
          <span>SMSUMIT</span>
          <ShieldCheck className="w-4 h-4 text-blue-400" />
        </h3>

        <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mt-0.5">
          Official Content Creator & Store Owner
        </p>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl my-4 text-xs text-slate-300 space-y-2 text-left">
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>100% Tested Safe APKs & Mods</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Daily Updates & Unlocked VIP Releases</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Direct Community Support & Reviews</span>
          </div>
        </div>

        <a
          href={youtubeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-xl shadow-red-600/30 active:scale-95 transition flex items-center justify-center gap-2 mb-2"
        >
          <Youtube className="w-4 h-4" />
          <span>Visit YouTube Channel</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>

        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1 mt-3">
          Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the community
        </p>
      </motion.div>
    </div>
  );
};
