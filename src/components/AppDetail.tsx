import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Flag,
  ImageOff,
  Send,
  Star,
  X,
} from 'lucide-react';
import type { AppItem, AppStats, ReviewItem } from '../types';
import {
  addAppReview,
  incrementAppDownload,
  submitAppRequest,
  submitBrokenLinkReport,
} from '../services/firebase';
import { formatCount, formatSize, getScreenshots } from '../utils/screenshots';

interface Props {
  app: AppItem;
  stats: AppStats | undefined;
  onClose: () => void;
}

function reviewsFromStats(stats: AppStats | undefined, appId: string): ReviewItem[] {
  const out: ReviewItem[] = [];
  const comments = stats?.comments;
  if (Array.isArray(comments)) out.push(...comments.filter(Boolean));
  else if (comments && typeof comments === 'object') {
    for (const [id, c] of Object.entries(comments)) {
      if (c) out.push({ ...c, id });
    }
  }
  // Local backup reviews (added on this device before Firebase sync)
  try {
    const local: ReviewItem[] = JSON.parse(localStorage.getItem(`reviews_${appId}`) || '[]');
    const seen = new Set(out.map((r) => `${r.user}|${r.text}`));
    for (const r of local) {
      if (!seen.has(`${r.user}|${r.text}`)) out.push(r);
    }
  } catch {
    /* ignore */
  }
  return out;
}

export function AppDetail({ app, stats, onClose }: Props) {
  const screenshots = getScreenshots(app);
  const reviews = reviewsFromStats(stats, app.id);
  const railRef = useRef<HTMLDivElement>(null);
  const [shotIdx, setShotIdx] = useState(0);

  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSent, setReviewSent] = useState(false);

  const [reqNote, setReqNote] = useState('');
  const [reqSent, setReqSent] = useState(false);
  const [reportReason, setReportReason] = useState('Download link not working');
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const scrollShot = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const onShotScroll = () => {
    const el = railRef.current;
    if (!el || screenshots.length === 0) return;
    setShotIdx(Math.round(el.scrollLeft / (el.clientWidth * 0.85)));
  };

  const handleDownload = () => {
    void incrementAppDownload(app.id);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await addAppReview(app.id, { user: reviewName, text: reviewText, rating: reviewRating });
    if (ok) {
      setReviewSent(true);
      setReviewText('');
    }
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitAppRequest({ appName: app.name, category: app.cat, note: reqNote || undefined });
    if (ok) setReqSent(true);
  };

  const submitReport = async () => {
    const ok = await submitBrokenLinkReport({ appName: app.name, appId: app.id, reason: reportReason });
    if (ok) setReportSent(true);
  };

  const size = formatSize(app.mb);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto" role="dialog" aria-modal="true" aria-label={app.name}>
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-28">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-sm font-bold text-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded-lg px-2 py-1"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mt-4">
          {app.icon ? (
            <img
              src={app.icon}
              alt={`${app.name} icon`}
              width={80}
              height={80}
              className="w-20 h-20 rounded-2xl object-cover bg-slate-800 shrink-0"
            />
          ) : (
            <span className="w-20 h-20 rounded-2xl bg-violet-600/20 text-violet-300 flex items-center justify-center text-3xl font-extrabold shrink-0">
              {(app.name || '?').charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold leading-tight">{app.name}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {app.developer || app.cat || 'Apps'}
              {app.ver ? ` • v${app.ver}` : ''}
            </p>
            <p className="flex items-center gap-3 mt-1 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                {(app.rating ?? 4.8).toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Download className="w-4 h-4" />
                {formatCount(stats?.downloads ?? app.downloads ?? 0)} downloads
              </span>
              {size ? <span>{size}</span> : null}
            </p>
          </div>
        </div>

        {/* Download */}
        <a
          href={app.link}
          onClick={handleDownload}
          className="mt-5 flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 font-extrabold text-base shadow-lg shadow-fuchsia-500/25 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <Download className="w-5 h-5" />
          Download APK{size ? ` (${size})` : ''}
        </a>
        <p className="text-center text-xs text-slate-500 mt-2">
          {app.minAndroid ? `Requires Android ${app.minAndroid} • ` : ''}Free download
        </p>

        {/* Screenshots — ONLY real screenshots. Never the icon as a fake screenshot. */}
        <h2 className="text-base font-extrabold mt-7 mb-2">Screenshots</h2>
        {screenshots.length > 0 ? (
          <div className="relative">
            <div
              ref={railRef}
              onScroll={onShotScroll}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-2xl"
            >
              {screenshots.map((src, i) => (
                <img
                  key={`${src}-${i}`}
                  src={src}
                  alt={`${app.name} screenshot ${i + 1}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="snap-start shrink-0 w-[78%] max-h-[420px] object-contain rounded-2xl bg-slate-900 border border-white/10"
                />
              ))}
            </div>
            {screenshots.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous screenshot"
                  onClick={() => scrollShot(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next screenshot"
                  onClick={() => scrollShot(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="flex justify-center gap-1.5 mt-2">
                  {screenshots.map((_, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full ${i === shotIdx ? 'bg-fuchsia-500' : 'bg-white/25'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 flex flex-col items-center text-center">
            {app.icon ? (
              <img
                src={app.icon}
                alt={`${app.name} icon`}
                width={96}
                height={96}
                className="w-24 h-24 rounded-2xl object-cover bg-slate-800"
              />
            ) : (
              <ImageOff className="w-10 h-10 text-slate-500" />
            )}
            <p className="text-sm text-slate-400 mt-3">Is app ke screenshots abhi available nahi hain.</p>
          </div>
        )}

        {/* About */}
        <h2 className="text-base font-extrabold mt-7 mb-2">About this app</h2>
        <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">{app.desc || `${app.name} — premium mod APK.`}</p>
        {app.changelog ? (
          <p className="text-sm leading-relaxed text-slate-400 mt-3 whitespace-pre-line">
            <span className="font-bold text-slate-200">What&apos;s new: </span>
            {app.changelog}
          </p>
        ) : null}

        {/* Reviews */}
        <h2 className="text-base font-extrabold mt-7 mb-2">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400">Abhi koi review nahi hai — pehla review aap likhiye.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.slice(0, 10).map((r, i) => (
              <li key={r.id || `${r.user}-${i}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="flex items-center gap-2 text-sm">
                  <span className="font-bold">{r.user}</span>
                  <span className="inline-flex items-center gap-0.5 text-amber-400 text-xs">
                    <Star className="w-3.5 h-3.5" fill="currentColor" />
                    {r.rating}
                  </span>
                  <span className="text-slate-500 text-xs ml-auto">{r.time}</span>
                </p>
                <p className="text-sm text-slate-300 mt-1">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
        {reviewSent ? (
          <p className="text-sm font-bold text-emerald-400 mt-3">Review bhej diya — shukriya!</p>
        ) : (
          <form onSubmit={submitReview} className="mt-3 space-y-2">
            <input
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              required
              maxLength={40}
              placeholder="Aapka naam"
              className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
            />
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={reviewRating === n}
                  aria-label={`${n} star`}
                  onClick={() => setReviewRating(n)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${n <= reviewRating ? 'text-amber-400' : 'text-slate-600'}`}
                    fill={n <= reviewRating ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              maxLength={500}
              rows={3}
              placeholder="Apna review likhiye…"
              className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <Send className="w-4 h-4" /> Review bhejo
            </button>
          </form>
        )}

        {/* Request this app */}
        <h2 className="text-base font-extrabold mt-7 mb-2">Request this app</h2>
        {reqSent ? (
          <p className="text-sm font-bold text-emerald-400">Request bhej di — jald add karne ki koshish karenge!</p>
        ) : (
          <form onSubmit={submitRequest} className="space-y-2">
            <p className="text-sm text-slate-400">
              Koi aur version chahiye ya is app me kuch missing hai? Request bhejiye.
            </p>
            <textarea
              value={reqNote}
              onChange={(e) => setReqNote(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Kya chahiye? (optional)"
              className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <Send className="w-4 h-4" /> Request bhejo
            </button>
          </form>
        )}

        {/* Broken link report */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 mt-7">
          <p className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Link kaam nahi kar raha?
          </p>
          {reportSent ? (
            <p className="text-sm font-bold text-emerald-400 mt-2">Report bhej di — check karke fix karenge.</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                aria-label="Problem"
                className="flex-1 rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400"
              >
                <option>Download link not working</option>
                <option>Wrong version</option>
                <option>Wrong app downloaded</option>
                <option>File corrupted</option>
                <option>Other problem</option>
              </select>
              <button
                type="button"
                onClick={submitReport}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/90 text-slate-950 px-4 py-2.5 text-sm font-bold hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <Flag className="w-4 h-4" /> Report karo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
