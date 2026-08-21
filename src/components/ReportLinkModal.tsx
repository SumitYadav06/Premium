import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  AlertTriangle,
  Send,
  CheckCircle2,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { AppItem } from '../types';
import { submitBrokenLinkReport } from '../services/firebase';

interface ReportLinkModalProps {
  app: AppItem | null;
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const ReportLinkModal: React.FC<ReportLinkModalProps> = ({
  app,
  isOpen,
  onClose,
  theme
}) => {
  const [reason, setReason] = useState('Link is broken or returns 404');
  const [extraDetails, setExtraDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen || !app) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await submitBrokenLinkReport({
      appName: app.name,
      appId: app.id,
      reason: `${reason}. ${extraDetails}`.trim()
    });

    setIsSubmitting(false);
    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      onClose();
    }, 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className={`relative w-full max-w-md rounded-[2.5rem] p-6 border shadow-2xl overflow-hidden z-10 ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-xl transition ${
              theme === 'dark'
                ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Report Broken Link</h2>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">
                {app.name} (v{app.ver})
              </p>
            </div>
          </div>

          {isDone ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Report Received!</h3>
              <p className="text-xs text-slate-400">
                Our automated mirror re-fetcher and admins will update this download link shortly.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Select Issue Type
                </label>
                <div className="space-y-2 text-xs">
                  {[
                    'Download link is broken or 404',
                    'File download is extremely slow or stuck',
                    'App crashes after installation on Android',
                    'Version is outdated, newer APK available'
                  ].map((item) => (
                    <label
                      key={item}
                      onClick={() => setReason(item)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                        reason === item
                          ? 'bg-purple-950/40 border-purple-500 text-purple-200'
                          : 'bg-slate-800/40 border-slate-700/40 text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="issueType"
                        checked={reason === item}
                        onChange={() => setReason(item)}
                        className="text-purple-600 focus:ring-0"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="e.g. Phone model: OnePlus 11, error message..."
                  value={extraDetails}
                  onChange={(e) => setExtraDetails(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending Report...' : 'Submit Broken Link Report'}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
