import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle,
  X,
  Heart,
  Instagram,
  ExternalLink,
  MessageCircle,
  Globe,
  Share2,
  Copy,
  Check,
  Download
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const websiteUrl = STORE_CONFIG.STORE_BASE_URL || "https://sumityadav06.github.io/Premium/";
  const storeApkUrl = STORE_CONFIG.STORE_APP_APK_URL || "https://archive.org/download/sample-apk-files/sample-app.apk";

  const handleOpenWebsite = () => {
    window.open(websiteUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyWebsiteLink = async () => {
    try {
      await navigator.clipboard.writeText(websiteUrl);
      setCopiedLink(true);
      setCopyToast('Store Website link copied!');
      setTimeout(() => {
        setCopiedLink(false);
        setCopyToast(null);
      }, 3000);
    } catch {
      setCopyToast('Failed to copy link.');
      setTimeout(() => setCopyToast(null), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `🔥 *${STORE_CONFIG.STORE_NAME}* - Official VIP APK & Mod Store\n` +
      `🛡️ 100% Virus-Free & Verified Android Apps\n\n` +
      `🌐 *Visit Official Website:* ${websiteUrl}\n` +
      `📥 *Download Store APK:* ${storeApkUrl}\n\n` +
      `👑 By *${STORE_CONFIG.OWNER_NAME}* (@${instagramUsername})`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    const text = `🔥 Check out ${STORE_CONFIG.STORE_NAME} - 100% Tested VIP APKs & Mods!\n` +
      `🌐 Store Website: ${websiteUrl}\n` +
      `📥 Store APK: ${storeApkUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: STORE_CONFIG.STORE_NAME,
          text: text,
          url: websiteUrl
        });
        return;
      } catch {
        // User dismissed
      }
    }
    // Fallback to clipboard
    handleCopyWebsiteLink();
  };

  const handleDownloadStoreApk = () => {
    const link = document.createElement('a');
    link.href = storeApkUrl;
    link.download = 'PremiumStore.apk';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <div className="fixed inset-0 z-[8600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className={`relative w-full max-w-md rounded-3xl p-5 sm:p-6 text-center shadow-2xl border overflow-hidden select-none my-8 ${
          theme === 'dark'
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Toast Notification */}
        {copyToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 py-1.5 px-4 rounded-full bg-purple-600 text-white text-xs font-bold shadow-xl animate-fade-in flex items-center gap-1.5 whitespace-nowrap">
            <Check className="w-3.5 h-3.5" />
            <span>{copyToast}</span>
          </div>
        )}

        {/* Glow behind modal */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar with Instagram Animated Circle Ring */}
        <div className="relative mx-auto w-24 h-24 mb-3">
          <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-full blur-md opacity-80 animate-pulse" />
          <img
            src={ownerImg || STORE_CONFIG.OWNER_IMAGE || "https://i.ibb.co/HffVtwhY/image.jpg"}
            alt="Sumit Yadav"
            className="relative w-full h-full rounded-full object-cover border-2 border-pink-500 shadow-2xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://i.ibb.co/HffVtwhY/image.jpg";
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

        <p className="text-xs text-pink-400 font-bold uppercase tracking-widest mb-3">
          Official Content Creator & Store Owner
        </p>

        {/* Visit Site Button & Store Hub Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl my-3 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-purple-400" /> Official Website URL
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
              Live Link
            </span>
          </div>

          <div className="bg-slate-950/90 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-slate-300 truncate select-all">
              {websiteUrl}
            </span>
            <button
              onClick={handleCopyWebsiteLink}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex-shrink-0 cursor-pointer"
              title="Copy Website Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleOpenWebsite}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-purple-600/25"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visit Site</span>
            </button>

            <button
              onClick={handleDownloadStoreApk}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Direct Download Store APK"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Store APK</span>
            </button>
          </div>
        </div>

        {/* Direct In-App Instagram Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={handleOpenDirectChat}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:via-pink-500 hover:to-purple-500 shadow-lg shadow-pink-600/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat with owner</span>
          </button>

          <button
            onClick={handleOpenInstagram}
            className="w-full py-2 px-4 rounded-xl font-bold text-xs text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>Visit Instagram Profile</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1 mt-3">
          Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the community
        </p>
      </motion.div>
    </div>
  );
};
