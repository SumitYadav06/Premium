import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  CheckCircle2,
  Trash2,
  Smartphone,
  X,
  Sparkles,
  HardDrive,
  ExternalLink
} from 'lucide-react';
import { DownloadTask } from '../types';

interface DownloadManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: DownloadTask[];
  onClearHistory: () => void;
  onInstallAgain: (task: DownloadTask) => void;
  theme: 'dark' | 'light';
}

export const DownloadManagerDrawer: React.FC<DownloadManagerDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  onClearHistory,
  onInstallAgain,
  theme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[8500] flex justify-end bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className={`w-full max-w-md h-full flex flex-col p-6 shadow-2xl border-l select-none ${
          theme === 'dark'
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white leading-none">
                Download Manager
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {tasks.length} Package{tasks.length === 1 ? '' : 's'} in history
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <HardDrive className="w-12 h-12 stroke-[1.5] mb-3 text-slate-600" />
              <p className="text-sm font-bold text-slate-400">No Downloads Yet</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                When you download apps or APKs, their installation status and direct installers will show up here.
              </p>
            </div>
          ) : (
            tasks.map((t, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={t.appIcon}
                    alt={t.appName}
                    className="w-12 h-12 rounded-xl object-cover border border-purple-500/30"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">{t.appName}</h4>
                    <p className="text-[10px] text-purple-400 font-mono">
                      v{t.version} • {t.sizeMb} MB
                    </p>
                    <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Ready to Install
                    </span>
                  </div>

                  <button
                    onClick={() => onInstallAgain(t)}
                    className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow active:scale-95 transition flex items-center gap-1"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Install</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {tasks.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
            <span className="text-[10px] text-slate-500 font-mono">
              Auto-saved locally
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
