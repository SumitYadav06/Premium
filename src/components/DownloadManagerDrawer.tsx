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
  onRemoveTask?: (task: DownloadTask, index: number) => void;
  theme: 'dark' | 'light';
}

export const DownloadManagerDrawer: React.FC<DownloadManagerDrawerProps> = ({
  isOpen,
  onClose,
  tasks = [],
  onClearHistory,
  onInstallAgain,
  onRemoveTask,
  theme
}) => {
  if (!isOpen) return null;
  const safeTasks = Array.isArray(tasks) ? tasks : [];

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
              <h3 className="font-black text-base leading-none">
                Download Manager
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {safeTasks.length} Saved Package{safeTasks.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {safeTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <HardDrive className="w-12 h-12 stroke-[1.5] mb-3 text-slate-600" />
              <p className="text-sm font-bold text-slate-400">No Saved Packages</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                When you download or install APKs, their packages and quick installers will appear here.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {safeTasks.map((t, idx) => (
                <motion.div
                  key={`${t.appId || t.appName}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-md group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={t.appIcon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"}
                      alt={t.appName}
                      className="w-12 h-12 rounded-xl object-cover border border-purple-500/30 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-white truncate">{t.appName}</h4>
                      <p className="text-[10px] text-purple-400 font-mono">
                        v{t.version} • {t.sizeMb} MB
                      </p>
                      <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Saved Package
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Install / Re-install Button */}
                      <button
                        onClick={() => onInstallAgain(t)}
                        className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow active:scale-95 transition flex items-center gap-1 cursor-pointer"
                        title="Install / Re-install APK"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Install</span>
                      </button>

                      {/* Remove / Delete Button */}
                      {onRemoveTask && (
                        <button
                          onClick={() => onRemoveTask(t, idx)}
                          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 hover:border-red-500/40 transition active:scale-95 cursor-pointer"
                          title="Remove from Downloads"
                          aria-label={`Remove ${t.appName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Actions */}
        {safeTasks.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition font-bold cursor-pointer py-1 px-2 rounded-lg hover:bg-red-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All History
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
