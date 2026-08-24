import React from 'react';
import { ShieldAlert, ExternalLink, RefreshCw } from 'lucide-react';
import { StoreStatus } from '../types';
import { STORE_CONFIG } from '../config';

interface KillSwitchScreenProps {
  status: StoreStatus;
}

export const KillSwitchScreen: React.FC<KillSwitchScreenProps> = ({ status }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      {/* Warning Icon */}
      <div className="relative mb-6">
        <div className="bg-red-500/10 p-8 rounded-full border-2 border-red-500/40 shadow-2xl shadow-red-500/20 animate-pulse">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>
      </div>

      <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">
        ACCESS RESTRICTED
      </h2>

      <p className="text-slate-400 text-sm max-w-sm font-medium mb-6">
        The store is temporarily in maintenance mode or requires an update to continue accessing application files.
      </p>

      {/* Message box */}
      <div className="bg-slate-900/90 border border-red-500/30 p-5 rounded-2xl max-w-sm w-full mb-8 shadow-2xl backdrop-blur-md">
        <p className="text-red-300 text-sm font-medium italic leading-relaxed">
          "{status.msg || 'The store is undergoing scheduled updates. Please check back shortly.'}"
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        {status.link && status.link !== '#' && (
          <a
            href={status.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <span>Update Now</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <button
          onClick={() => window.location.reload()}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 px-4 rounded-xl text-sm transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
};
