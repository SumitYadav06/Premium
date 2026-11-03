import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  X,
  Heart,
  Send,
  ExternalLink,
  Globe,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';
import { STORE_CONFIG } from '../config';
import { VerifiedBadge } from './AppDetailView';

interface OwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerImg?: string;
  telegramLink?: string;
  telegramUsername?: string;
  theme: 'dark' | 'light';
}

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const }
});

export const OwnerModal: React.FC<OwnerModalProps> = ({
  isOpen,
  onClose,
  ownerImg = STORE_CONFIG.OWNER_IMAGE,
  telegramLink = STORE_CONFIG.OWNER_TELEGRAM,
  telegramUsername = STORE_CONFIG.OWNER_TELEGRAM_USERNAME,
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

  const handleOpenTelegram = (e: React.MouseEvent) => {
    e.preventDefault();
    const username = telegramUsername || 'apna_jugaad';
    const fallbackUrl = telegramLink.startsWith('http')
      ? telegramLink
      : `https://t.me/${username}`;

    // Agar Telegram app khul jaye (page background me jaye) to fallback band kar do
    const timer = window.setTimeout(() => {
      if (!document.hidden) {
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      }
    }, 1200);
    const onVis = () => {
      if (document.hidden) {
        window.clearTimeout(timer);
        document.removeEventListener('visibilitychange', onVis);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    // Seedha Telegram app ke andar channel kholo (no browser, no VPN issue)
    window.location.href = `tg://resolve?domain=${username}`;
  };

  const dark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[8600] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 26 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        className={`relative w-full max-w-md rounded-[2rem] shadow-2xl border overflow-hidden select-none my-8 ${
          dark ? 'bg-slate-950 text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Toast Notification */}
        {copyToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 py-1.5 px-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-xs font-bold shadow-xl flex items-center gap-1.5 whitespace-nowrap">
            <Check className="w-3.5 h-3.5" />
            <span>{copyToast}</span>
          </div>
        )}

        {/* ===== Cover header — living artwork ===== */}
        <div className="relative h-28 overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400">
          <img
            src={STORE_CONFIG.STORE_APP_ICON}
            alt=""
            aria-hidden="true"
            className="kenburns absolute inset-0 w-full h-full object-cover opacity-30"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="live-beam" style={{ left: '20%' }} />
          <span className="absolute top-3 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur text-white text-[9px] font-black tracking-[0.2em] border border-white/25">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            CREATOR LIVE
          </span>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 text-white rounded-full bg-black/35 backdrop-blur hover:bg-black/55 transition cursor-pointer z-10 border border-white/25"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 sm:px-6 pb-6 text-center relative">
          {/* Avatar — cover se overlap, ghumta ring */}
          <motion.div {...stagger(0.1)} className="relative mx-auto w-24 h-24 -mt-12 mb-3">
            <div className="absolute -inset-1.5 rounded-full ring-conic opacity-90" aria-hidden="true" />
            <img
              src={ownerImg || STORE_CONFIG.OWNER_IMAGE || "https://i.ibb.co/HffVtwhY/image.jpg"}
              alt={STORE_CONFIG.OWNER_NAME}
              className="relative w-full h-full rounded-full object-cover border-[3px] border-white shadow-2xl bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://i.ibb.co/HffVtwhY/image.jpg";
              }}
            />
            <div className="absolute bottom-0 right-0 bg-gradient-to-tr from-sky-400 to-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-md">
              <Send className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          <motion.div {...stagger(0.18)}>
            <div className="flex items-center justify-center gap-1.5 leading-tight mb-1">
              <h3 className="font-display font-black text-[22px] rainbow-text">
                {STORE_CONFIG.OWNER_NAME}
              </h3>
              <VerifiedBadge size={20} />
            </div>
            <p className={`text-[10px] font-black uppercase tracking-[0.24em] mb-4 ${dark ? 'text-fuchsia-300' : 'text-fuchsia-600'}`}>
              Official Content Creator & Store Owner
            </p>
          </motion.div>

          {/* Mini perks */}
          <motion.div {...stagger(0.26)} className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, label: '100% Tested' },
              { icon: <Zap className="w-4 h-4 text-amber-500" />, label: 'Daily Updates' },
              { icon: <Users className="w-4 h-4 text-sky-500" />, label: 'VIP Community' }
            ].map((p) => (
              <div
                key={p.label}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl border ${
                  dark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {p.icon}
                <span className="text-[9.5px] font-black uppercase tracking-wide text-slate-400">{p.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Website card */}
          <motion.div
            {...stagger(0.34)}
            className={`p-3.5 rounded-3xl text-left space-y-2.5 border ${
              dark
                ? 'bg-white/[0.04] border-white/10'
                : 'bg-gradient-to-br from-violet-50 via-fuchsia-50 to-amber-50 border-fuchsia-200/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${dark ? 'text-fuchsia-300' : 'text-fuchsia-600'}`}>
                <Globe className="w-3.5 h-3.5" /> Official Website
              </span>
              <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>

            <div className={`p-2.5 rounded-xl flex items-center justify-between gap-2 border ${dark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
              <span className={`text-xs font-mono truncate select-all ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                {websiteUrl}
              </span>
              <button
                onClick={handleCopyWebsiteLink}
                className={`p-1.5 rounded-lg transition flex-shrink-0 cursor-pointer ${dark ? 'bg-white/10 hover:bg-white/20 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                title="Copy Website Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleOpenWebsite}
                className="btn-shine w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-fuchsia-500/30"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Site</span>
              </button>
              <button
                onClick={handleDownloadStoreApk}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border ${
                  dark ? 'bg-white/[0.06] border-white/15 text-slate-100 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:border-fuchsia-300'
                }`}
                title="Direct Download Store APK"
              >
                <Download className="w-3.5 h-3.5 text-fuchsia-500" />
                <span>Store APK</span>
              </button>
            </div>
          </motion.div>

          {/* Telegram */}
          <motion.div {...stagger(0.42)} className="space-y-2 pt-4">
            <button
              onClick={handleOpenTelegram}
              className="tg-glow btn-shine w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-600/30 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 fill-white" />
              <span>Join Telegram Channel</span>
            </button>
            <p className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />@{telegramUsername} • Daily VIP Mod Updates
            </p>
          </motion.div>

          <motion.p {...stagger(0.5)} className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-4">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> for the community
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};
