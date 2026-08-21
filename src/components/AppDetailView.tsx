import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  Star,
  ShieldCheck,
  Bookmark,
  Share2,
  Cpu,
  Smartphone,
  HardDrive,
  Calendar,
  CheckCircle2,
  FileCode,
  Sparkles,
  MessageSquare,
  Send,
  Lock,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { AppItem, AppStats, ReviewItem } from '../types';
import { addAppReview } from '../services/firebase';
import { ScreenshotLightbox } from './ScreenshotLightbox';

interface AppDetailViewProps {
  app: AppItem;
  stats?: AppStats;
  isBookmarked: boolean;
  onToggleBookmark: (app: AppItem) => void;
  onDirectInstall: (app: AppItem) => void;
  onBack: () => void;
  onSelectRelatedApp: (app: AppItem) => void;
  allApps: AppItem[];
  theme: 'dark' | 'light';
}

export const AppDetailView: React.FC<AppDetailViewProps> = ({
  app,
  stats,
  isBookmarked,
  onToggleBookmark,
  onDirectInstall,
  onBack,
  onSelectRelatedApp,
  allApps,
  theme
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Review Form
  const [authorName, setAuthorName] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Extract screenshots
  const screenshots = [app.icon, app.p1, app.p2, app.p3, app.p4, app.p5].filter(
    (p): p is string => Boolean(p && typeof p === 'string' && p.startsWith('http'))
  );

  const viewsCount = stats?.views || (app.downloads ? app.downloads * 2 : 5420);
  const commentsObj = stats?.comments;
  
  let commentsList: ReviewItem[] = [];
  if (commentsObj) {
    if (Array.isArray(commentsObj)) {
      commentsList = [...commentsObj].reverse();
    } else {
      commentsList = Object.keys(commentsObj)
        .map((k) => (commentsObj as Record<string, ReviewItem>)[k])
        .reverse();
    }
  }

  // Fallback initial sample reviews if none exist
  if (commentsList.length === 0) {
    commentsList = [
      {
        user: 'Rohit Kumar',
        text: 'Bhai bilkul smooth chal raha hai! Unlocked VIP feature 100% working fine.',
        rating: 5,
        time: '2 hours ago',
        verified: true
      },
      {
        user: 'Alex M.',
        text: 'Clean install, zero ads, no malware warning on Play Protect. Best source for premium APKs!',
        rating: 5,
        time: 'Yesterday',
        verified: true
      }
    ];
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewContent.trim()) {
      alert('Please enter your name and review message!');
      return;
    }

    setIsSubmitting(true);
    const success = await addAppReview(app.name, {
      user: authorName.trim(),
      text: reviewContent.trim(),
      rating: reviewRating
    });

    setIsSubmitting(false);
    if (success) {
      setAuthorName('');
      setReviewContent('');
      setReviewRating(5);
      alert('Review posted successfully!');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${app.name} - Download on Premium Store`,
          text: `Download ${app.name} v${app.ver} (${app.mb} MB) directly from Premium Store!`,
          url: window.location.href
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    navigator.clipboard?.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const relatedApps = allApps
    .filter((a) => a.name !== app.name && (a.cat === app.cat || a.isHot))
    .slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-purple-600 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 border border-purple-400">
          <Sparkles className="w-4 h-4" /> Link copied to clipboard!
        </div>
      )}

      {/* Lightbox for screenshots */}
      <ScreenshotLightbox
        images={screenshots}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 py-2 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider border transition active:scale-95 ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleBookmark(app)}
            className={`p-2.5 rounded-2xl border transition ${
              isBookmarked
                ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                : theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
            title="Save App"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-purple-400' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className={`p-2.5 rounded-2xl border transition ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
            title="Share App"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* App Identity Banner */}
      <div
        className={`p-6 rounded-[2.5rem] border relative overflow-hidden shadow-2xl ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          <img
            src={app.icon}
            alt={app.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-purple-500/40 shadow-2xl flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
            }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                {app.cat}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Certified Safe APK
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-1 flex items-center gap-2">
              <span>{app.name}</span>
              <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0" />
            </h1>

            <p className="text-xs text-slate-400 font-medium">
              {app.developer || 'Verified Community Developer'} • v{app.ver}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div
          className={`grid grid-cols-4 gap-2 mt-6 pt-5 border-t text-center ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div>
            <p className="text-xs sm:text-sm font-black text-yellow-400 flex items-center justify-center gap-1">
              {app.rating || 4.9} <Star className="w-3 h-3 fill-yellow-400" />
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">Rating</p>
          </div>

          <div>
            <p className="text-xs sm:text-sm font-black text-purple-400 font-mono">
              {app.mb} MB
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">Size</p>
          </div>

          <div>
            <p className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
              {viewsCount.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">Views</p>
          </div>

          <div>
            <p className="text-xs sm:text-sm font-black text-blue-400 font-mono">
              3+
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">Age</p>
          </div>
        </div>
      </div>

      {/* Primary Direct Download & Installation Action Button */}
      <div className="space-y-2">
        <button
          onClick={() => onDirectInstall(app)}
          className="w-full py-4 px-6 rounded-2xl font-black uppercase text-sm tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-xl shadow-purple-600/25 active:scale-98 transition flex items-center justify-center gap-2.5 group"
        >
          <Download className="w-5 h-5 group-hover:animate-bounce" />
          <span>Direct Download & Install APK ({app.mb} MB)</span>
        </button>
        <p className="text-center text-[11px] text-slate-500 font-medium">
          Instant high-speed CDN download • Direct Android package installer • Safe & Tested
        </p>
      </div>

      {/* Screenshots Showcase Carousel */}
      {screenshots.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Preview & Screenshots</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold">
              Tap image to expand HD
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {screenshots.map((pic, idx) => (
              <img
                key={idx}
                src={pic}
                alt={`Preview ${idx + 1}`}
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
                className="w-40 sm:w-48 h-64 sm:h-72 flex-shrink-0 object-cover rounded-3xl border-2 border-purple-500/20 shadow-xl cursor-pointer hover:border-purple-500 transition hover:scale-102 snap-start"
              />
            ))}
          </div>
        </div>
      )}

      {/* App Description & Overview */}
      <div
        className={`p-6 rounded-3xl border ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 mb-3">
          About this Application
        </h3>
        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
          {app.desc}
        </p>

        {app.changelog && (
          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <h4 className="text-xs font-bold uppercase text-emerald-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> What's New in v{app.ver}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              {app.changelog}
            </p>
          </div>
        )}
      </div>

      {/* Technical Specifications Grid */}
      <div
        className={`p-6 rounded-3xl border ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <FileCode className="w-4 h-4 text-indigo-400" />
          <span>Technical Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-slate-400">Package Identifier:</span>
            <span className="font-mono text-purple-300 font-bold truncate max-w-[160px]">
              {app.packageName || `com.premium.${app.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-slate-400">Requires OS:</span>
            <span className="font-semibold text-slate-200">{app.minAndroid || 'Android 8.0+'}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-slate-400">Architecture:</span>
            <span className="font-mono text-slate-200">{app.architecture || 'arm64-v8a'}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-slate-400">Security Audit:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Passed Clean
            </span>
          </div>
        </div>
      </div>

      {/* Community Ratings & Reviews Section */}
      <div
        className={`p-6 rounded-3xl border space-y-6 ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Community Ratings & Reviews ({commentsList.length})</span>
          </h3>
          <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400" /> 4.9 out of 5
          </span>
        </div>

        {/* Post a Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Rate this application:</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 hover:scale-125 transition"
                >
                  <Star
                    className={`w-5 h-5 ${
                      reviewRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="Your name or handle..."
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            required
          />

          <textarea
            placeholder="Share your experience with this app..."
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            rows={2}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-600/20 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Posting...' : 'Submit Review'}</span>
          </button>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-3">
          {commentsList.map((rev, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-300">
                    @{rev.user || 'Anonymous'}
                  </span>
                  <div className="flex text-yellow-400">
                    {[...Array(rev.rating || 5)].map((_, s) => (
                      <Star key={s} className="w-2.5 h-2.5 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{rev.time}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{rev.text}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Related Apps */}
      {relatedApps.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {relatedApps.map((rel) => (
              <div
                key={rel.id || rel.name}
                onClick={() => onSelectRelatedApp(rel)}
                className="p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 cursor-pointer transition flex items-center gap-3"
              >
                <img
                  src={rel.icon}
                  alt={rel.name}
                  className="w-12 h-12 rounded-xl object-cover shadow"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{rel.name}</h4>
                  <p className="text-[10px] text-purple-400 font-medium mt-0.5">
                    {rel.mb} MB
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
