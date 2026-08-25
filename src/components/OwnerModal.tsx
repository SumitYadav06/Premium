import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle,
  X,
  Heart,
  Instagram,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { STORE_CONFIG } from '../config';
import { VerifiedBadge } from './AppDetailView';

interface OwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerImg?: string;
  instagramLink?: string;
  instagramUsername?: string;
  theme: 'dark' | 'light';
}

export const OwnerModal: React.FC<OwnerModalProps> = ({
  isOpen,
  onClose,
  ownerImg = STORE_CONFIG.OWNER_IMAGE,
  instagramLink = STORE_CONFIG.OWNER_INSTAGRAM,
  instagramUsername = STORE_CONFIG.OWNER_INSTAGRAM_USERNAME,
  theme
}) => {
  if (!isOpen) return null;

  const handleOpenInstagram = (e: React.MouseEvent) => {
    e.preventDefault();
    const webUrl = instagramLink.startsWith('http')
      ? instagramLink
      : `https://www.instagram.com/${instagramUsername}/`;

    window.open(webUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenDirectChat = (e: React.MouseEvent) => {
    e.preventDefault();
    const directDmUrl = `https://ig.me/m/${instagramUsername || 'sumyadav477'}`;
    window.open(directDmUrl, '_blank', 'noopener,noreferrer');
  };

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar with Instagram Badge */}
        <div className="relative mx-auto w-24 h-24 mb-4">
          <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-full blur-md opacity-80 animate-pulse" />
          <img
            src={ownerImg || STORE_CONFIG.OWNER_IMAGE || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"}
            alt="Sumit Yadav"
            className="relative w-full h-full rounded-full object-cover border-2 border-pink-500 shadow-2xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80";
            }}
          />
          {/* Instagram Avatar Badge */}
          <div className="absolute bottom-0 right-0 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white p-1.5 rounded-full border-2 border-slate-950 shadow-md">
            <Instagram className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 leading-tight mb-1">
          <h3 className="font-black text-xl">
            {STORE_CONFIG.OWNER_NAME}
          </h3>
          <VerifiedBadge size={20} />
        </div>

        <p className="text-xs text-pink-400 font-bold uppercase tracking-widest mt-0.5">
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
            <span>Direct Community Support on Instagram</span>
          </div>
        </div>

        {/* Direct In-App Instagram Action Buttons */}
        <div className="space-y-2 mb-2">
          <button
            onClick={handleOpenDirectChat}
            className="w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:via-pink-500 hover:to-purple-500 shadow-xl shadow-pink-600/30 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Send Direct Instagram DM</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          <button
            onClick={handleOpenInstagram}
            className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/40 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>View Instagram Profile</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1 mt-3">
          Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the community
        </p>
      </motion.div>
    </div>
  );
};
