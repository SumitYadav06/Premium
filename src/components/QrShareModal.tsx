import React from 'react';
import { motion } from 'motion/react';
import {
  QrCode,
  Smartphone,
  Download,
  X,
  Share2,
  Copy,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { AppItem } from '../types';

interface QrShareModalProps {
  app: AppItem | null;
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const QrShareModal: React.FC<QrShareModalProps> = ({
  app,
  isOpen,
  onClose,
  theme
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !app) return null;

  const downloadUrl = app.link || window.location.href;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    downloadUrl
  )}&bgcolor=0f172a&color=a855f7&margin=1`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[8950] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        className={`relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border overflow-hidden ${
          theme === 'dark'
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-black text-base leading-tight text-left">
            <span>Scan to Download</span>
            <span className="block text-[11px] text-purple-400 font-bold">Direct Mobile Transfer</span>
          </h3>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Point your phone camera at the QR code below to download <strong>{app.name}</strong> APK directly!
        </p>

        {/* QR Code Container */}
        <div className="p-4 rounded-2xl bg-slate-900 border-2 border-purple-500/30 inline-block mx-auto mb-4 shadow-xl">
          <img
            src={qrCodeApiUrl}
            alt="QR Code"
            className="w-48 h-48 rounded-xl object-contain"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleCopyLink}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Direct Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-purple-400" />
                <span>Copy Direct APK Link</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
