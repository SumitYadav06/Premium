import { Download, Star } from 'lucide-react';
import type { AppItem } from '../types';
import { formatCount, formatSize } from '../utils/screenshots';

interface Props {
  app: AppItem;
  downloads: number;
  onOpen: (app: AppItem) => void;
}

export function AppCard({ app, downloads, onOpen }: Props) {
  const size = formatSize(app.mb);
  return (
    <button
      type="button"
      onClick={() => onOpen(app)}
      className="w-full text-left rounded-2xl bg-white/[0.04] border border-white/10 p-3 transition-colors hover:bg-white/[0.07] hover:border-violet-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <div className="flex items-center gap-3">
        {app.icon ? (
          <img
            src={app.icon}
            alt=""
            width={56}
            height={56}
            loading="lazy"
            decoding="async"
            className="w-14 h-14 rounded-xl object-cover bg-slate-800 shrink-0"
          />
        ) : (
          <span className="w-14 h-14 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center text-xl font-extrabold shrink-0">
            {(app.name || '?').charAt(0)}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-[15px] leading-tight truncate">{app.name}</span>
          <span className="block text-xs text-slate-400 truncate mt-0.5">
            {app.cat || 'Apps'}
            {app.ver ? ` • v${app.ver}` : ''}
            {size ? ` • ${size}` : ''}
          </span>
          <span className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
              {(app.rating ?? 4.8).toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              {formatCount(downloads)}
            </span>
          </span>
        </span>
      </div>
    </button>
  );
}
