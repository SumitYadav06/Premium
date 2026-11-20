import { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import type { AppItem } from '../types';
import { formatCount } from '../utils/screenshots';
import { letterIconDataUri } from '../utils/letterIcon';

interface RankedApp {
  app: AppItem;
  downloads: number;
}

interface Props {
  ranked: RankedApp[];
  onSelect: (app: AppItem) => void;
}

const SPEED_PX_PER_SEC = 21;

/**
 * Top 10 rail — slow smooth horizontal auto-scroll via requestAnimationFrame
 * (~21px/sec), ping-pong at the ends. Pauses on hover / touch, and stays
 * still entirely when the user prefers reduced motion.
 */
export function Top10Rail({ ranked, onSelect }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const top10 = ranked.slice(0, 10);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || top10.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let last = performance.now();
    let dir = 1;

    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!pausedRef.current) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 0) {
          let next = el.scrollLeft + dir * SPEED_PX_PER_SEC * dt;
          if (next >= max) {
            next = max;
            dir = -1;
          } else if (next <= 0) {
            next = 0;
            dir = 1;
          }
          el.scrollLeft = next;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [top10.length]);

  if (top10.length === 0) return null;

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <section aria-label="Top 10 apps" className="mt-6">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-lg font-extrabold">Top 10 This Week</h2>
        <span className="text-xs text-slate-400">Most downloaded</span>
      </div>
      <div
        ref={trackRef}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        className="flex gap-3 overflow-x-auto scrollbar-none pt-3 pb-1 snap-x"
      >
        {top10.map(({ app, downloads }, idx) => (
          <button
            key={app.id}
            type="button"
            onClick={() => onSelect(app)}
            className="snap-start shrink-0 w-40 text-left rounded-2xl bg-white/[0.04] border border-white/10 p-3 transition-colors hover:bg-white/[0.07] hover:border-violet-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <span className="flex items-start gap-2">
              <span
                className={`rank-num ${idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : ''} text-[40px] font-extrabold leading-none w-[44px] text-center shrink-0`}
              >
                {idx + 1}
              </span>
              {app.icon ? (
                <img
                  src={app.icon}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="w-14 h-14 rounded-xl object-cover bg-slate-800"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.src.startsWith('data:image/svg+xml')) img.src = letterIconDataUri(app.name);
                  }}
                />
              ) : (
                <span className="w-14 h-14 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center text-xl font-extrabold">
                  {(app.name || '?').charAt(0)}
                </span>
              )}
            </span>
            <span className="block font-bold text-sm leading-tight truncate mt-2">{app.name}</span>
            <span className="block text-xs text-slate-400 truncate mt-0.5">
              {app.cat || 'Apps'}
              {app.ver ? ` • v${app.ver}` : ''}
            </span>
            <span className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
              <Download className="w-3.5 h-3.5" />
              {formatCount(downloads)} downloads
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
