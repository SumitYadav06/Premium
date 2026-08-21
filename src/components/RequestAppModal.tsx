import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Tag
} from 'lucide-react';
import { submitAppRequest } from '../services/firebase';
import { AppRequestItem } from '../types';

interface RequestAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

const SAMPLE_COMMUNITY_REQUESTS: AppRequestItem[] = [
  {
    id: 'req_1',
    appName: 'Canva Pro Ultra APK',
    category: 'Graphics',
    note: 'Please add with unlimited brand kit and unlocked SVG exports.',
    requesterName: 'Vikram S.',
    votes: 42,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    status: 'added'
  },
  {
    id: 'req_2',
    appName: 'GTA San Andreas Remastered Mod',
    category: 'Games',
    note: 'With 60 FPS graphics fix for Android 14/15 devices.',
    requesterName: 'Aman Deep',
    votes: 29,
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    status: 'reviewing'
  },
  {
    id: 'req_3',
    appName: 'Kinemaster Premium VIP',
    category: 'Video',
    note: 'No watermark and 4K 60FPS export support.',
    requesterName: 'Rahul',
    votes: 35,
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    status: 'added'
  }
];

export const RequestAppModal: React.FC<RequestAppModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  const [appName, setAppName] = useState('');
  const [category, setCategory] = useState('Tools');
  const [requesterName, setRequesterName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [communityRequests, setCommunityRequests] = useState<AppRequestItem[]>(() => {
    try {
      const local = JSON.parse(localStorage.getItem('premium_store_user_requests') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        return [...local, ...SAMPLE_COMMUNITY_REQUESTS];
      }
    } catch {}
    return SAMPLE_COMMUNITY_REQUESTS;
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;

    setIsSubmitting(true);
    const success = await submitAppRequest({
      appName: appName.trim(),
      category,
      note: note.trim(),
      requesterName: requesterName.trim() || 'Store Member'
    });

    setIsSubmitting(false);
    if (success) {
      setSubmittedSuccess(true);
      const newReq: AppRequestItem = {
        id: `req_${Date.now()}`,
        appName: appName.trim(),
        category,
        note: note.trim(),
        requesterName: requesterName.trim() || 'Store Member',
        votes: 1,
        createdAt: Date.now(),
        status: 'pending'
      };
      setCommunityRequests((prev) => [newReq, ...prev]);
      setAppName('');
      setNote('');
      setTimeout(() => {
        setSubmittedSuccess(false);
      }, 4000);
    }
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
          className={`relative w-full max-w-lg rounded-[2.5rem] p-6 sm:p-7 border shadow-2xl overflow-hidden z-10 max-h-[90vh] overflow-y-auto ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

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
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                Request an App or Mod <Sparkles className="w-4 h-4 text-purple-400" />
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Tell us which APK or VIP Mod you want next
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {submittedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 mb-4"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Thank you! Your app request has been submitted to the admin queue.</span>
            </motion.div>
          )}

          {/* Request Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 mb-6">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                App / Game Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Lightroom Premium, GTA Vice City..."
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Tools">Tools</option>
                  <option value="Video">Video & Editing</option>
                  <option value="Music">Music & Audio</option>
                  <option value="Games">Games</option>
                  <option value="Social">Social</option>
                  <option value="Graphics">Graphics & Photo</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul / Anonymous"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Specific Feature / Version Needed (Optional)
              </label>
              <textarea
                placeholder="e.g. Needs to have 4K 60fps export and VIP filters unlocked..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting Request...' : 'Send Request to Store'}</span>
            </button>
          </form>

          {/* Community Activity Feed */}
          <div className="border-t border-slate-800/80 pt-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center justify-between">
              <span>Recent Community Requests</span>
              <span className="text-[10px] text-purple-400 font-mono font-bold">
                {communityRequests.length} Requests
              </span>
            </h3>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {communityRequests.map((req, idx) => (
                <div
                  key={req.id || idx}
                  className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-bold text-white truncate">{req.appName}</span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                        {req.category || 'App'}
                      </span>
                    </div>
                    {req.note && (
                      <p className="text-[11px] text-slate-400 truncate italic">"{req.note}"</p>
                    )}
                    <span className="text-[10px] text-slate-500 font-medium">
                      by @{req.requesterName || 'Member'}
                    </span>
                  </div>

                  <div className="flex-shrink-0">
                    {req.status === 'added' ? (
                      <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Added
                      </span>
                    ) : req.status === 'reviewing' ? (
                      <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-950/60 border border-yellow-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> In Review
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
