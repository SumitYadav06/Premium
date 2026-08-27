import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Info
} from 'lucide-react';
import { submitAppRequest } from '../services/firebase';

interface RequestAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const RequestAppModal: React.FC<RequestAppModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  const [appName, setAppName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;

    setIsSubmitting(true);
    const success = await submitAppRequest({
      appName: appName.trim(),
      category: 'User Request',
      note: note.trim() || 'Fast User Request',
      requesterName: 'VIP Member'
    });

    setIsSubmitting(false);
    if (success) {
      setSubmittedSuccess(true);
      setAppName('');
      setNote('');
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window - Super Compact & Ultra Fast */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md rounded-3xl p-5 sm:p-6 border border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white shadow-2xl shadow-purple-950/70 overflow-hidden z-10"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 p-0.5 shadow-md shadow-purple-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5 font-mono">
                Request App / Mod <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Store owner ko direct notification send karein
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {submittedSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-2 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4"
            >
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white font-mono">Request Sent Successfully!</h3>
              <p className="text-xs text-emerald-300">
                Aapki request Premium Store database me deliver ho gayi hai.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field 1: App Name */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  App / Game Name <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lightroom Premium, Spotify VIP, GTA..."
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-slate-950 border border-purple-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 transition"
                />
              </div>

              {/* Field 2: Basic Question / Special Features */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  Kya Khaas Chahiye? (Features / Details)
                </label>
                <textarea
                  placeholder="e.g. No Ads, VIP Unlocked, Unlimited Coins, Latest version..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 transition resize-none"
                />
              </div>

              {/* Notice info */}
              <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-center gap-2 text-[11px] text-purple-300">
                <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Yeh request seedhe aapke store ke admin panel me save ho jayegi.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending Request...' : 'Send Request Now'}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
