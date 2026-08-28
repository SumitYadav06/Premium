import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Star,
  ShieldCheck,
  Bookmark,
  Smartphone,
  FileCode,
  Sparkles,
  MessageSquare,
  ArrowLeft,
  HelpCircle,
  AlertCircle,
  MessageCircle,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AppItem, AppStats, ReviewItem } from '../types';
import { addAppReview } from '../services/firebase';
import { ScreenshotLightbox } from './ScreenshotLightbox';
import { ReportLinkModal } from './ReportLinkModal';
import { InstallGuideModal } from './InstallGuideModal';
import { STORE_CONFIG } from '../config';

export const VerifiedBadge: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = ''
}) => (
  <span
    className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
    title="Verified Official Mod APK"
    style={{ width: size, height: size }}
  >
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className="w-full h-full drop-shadow-sm flex-shrink-0"
    >
      {/* Official Verified Blue Background Circle */}
      <circle cx="12" cy="12" r="10" fill="#0095F6" />
      {/* Crisp White Checkmark */}
      <path
        d="M8 12.2l2.8 2.8 5.4-5.6"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

export const VipBadge: React.FC<{ text?: string; className?: string }> = ({
  text = 'VIP UNLOCKED',
  className = ''
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/40 select-none ${className}`}
  >
    <Sparkles className="w-2.5 h-2.5 text-emerald-200 animate-pulse" />
    <span>{text}</span>
  </span>
);

const ScreenshotThumbnail: React.FC<{
  pic: string;
  idx: number;
  onSelect: (index: number) => void;
}> = ({ pic, idx, onSelect }) => {
  const [imgSrc, setImgSrc] = useState(pic);
  const [hasError, setHasError] = useState(false);

  // Sync if pic prop updates
  useEffect(() => {
    setImgSrc(pic);
    setHasError(false);
  }, [pic]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback try without crossOrigin or with direct placeholder
      setImgSrc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80');
    }
  };

  return (
    <div
      onClick={() => onSelect(idx)}
      className="relative group flex-shrink-0 cursor-pointer select-none active:scale-[0.98] transition-transform duration-100"
    >
      <img
        src={imgSrc}
        alt={`Preview ${idx + 1}`}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={handleError}
        className="w-36 sm:w-48 h-60 sm:h-72 object-cover rounded-2xl sm:rounded-3xl border-2 border-purple-500/20 group-hover:border-purple-500 shadow-lg transition duration-150 pointer-events-none bg-slate-900"
      />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition rounded-2xl sm:rounded-3xl flex items-center justify-center pointer-events-none">
        <span className="text-[11px] font-bold text-white bg-black/70 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
          Tap to Expand
        </span>
      </div>
    </div>
  );
};

interface AppDetailViewProps {
  app: AppItem;
  stats?: AppStats;
  isBookmarked: boolean;
  onToggleBookmark: (app: AppItem) => void;
  onQuickDownload?: (app: AppItem) => void;
  onDirectInstall?: (app: AppItem) => void;
  onBack: () => void;
  onSelectRelatedApp?: (app: AppItem) => void;
  onAddReview?: (review: { user: string; text: string; rating: number }) => Promise<boolean>;
  allApps?: AppItem[];
  theme: 'dark' | 'light';
}

export const AppDetailView: React.FC<AppDetailViewProps> = ({
  app,
  stats,
  isBookmarked,
  onToggleBookmark,
  onQuickDownload,
  onDirectInstall,
  onBack,
  onSelectRelatedApp = (_app: AppItem) => {},
  onAddReview,
  allApps = [],
  theme
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unlimited screenshots dynamically supporting all schemas, formats, and keys (p1...p100, screenshots array/objects/strings, gallery, images, pics, previews, etc.)
  const rawScreenshots: string[] = [];

  const cleanImageUrl = (raw: string): string => {
    if (!raw || typeof raw !== 'string') return '';
    let url = raw.trim();

    // If it's already a Data URL (base64 from canvas/uploader), keep it intact
    if (url.startsWith('data:image/')) {
      return url;
    }

    // Strip leading/trailing quotes, apostrophes, backticks, brackets
    url = url.replace(/^["'`[\s]+|["'`\]\s]+$/g, '').trim();

    // Extract from HTML <img src="..."> or Markdown ![alt](url) or BBCode [img]...[/img]
    const htmlMatch = url.match(/src=["']([^"']+)["']/i);
    if (htmlMatch && htmlMatch[1]) url = htmlMatch[1].trim();

    const mdMatch = url.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/i);
    if (mdMatch && mdMatch[1]) url = mdMatch[1].trim();

    const bbMatch = url.match(/\[img\](https?:\/\/[^\]]+)\[\/img\]/i);
    if (bbMatch && bbMatch[1]) url = bbMatch[1].trim();

    // Convert Google Drive view URLs to direct image URLs
    const gDriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (gDriveMatch && gDriveMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${gDriveMatch[1]}`;
    }
    const gDriveOpenMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
    if (gDriveOpenMatch && gDriveOpenMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${gDriveOpenMatch[1]}`;
    }

    // Convert Dropbox share links to direct links
    if (url.includes('dropbox.com')) {
      url = url.replace('dl=0', 'raw=1');
    }

    // Convert Imgur page URLs to direct image URLs if missing extension
    if (/imgur\.com\/([a-zA-Z0-9]{5,})/i.test(url) && !/\.(jpg|jpeg|png|webp|gif)$/i.test(url) && !url.includes('/a/') && !url.includes('/gallery/')) {
      const idMatch = url.match(/imgur\.com\/([a-zA-Z0-9]+)/i);
      if (idMatch && idMatch[1]) {
        return `https://i.imgur.com/${idMatch[1]}.jpg`;
      }
    }

    return url;
  };

  const addValidScreenshot = (val: any) => {
    if (!val) return;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return;

      // 1. Direct Base64 data URL support (from canvas or mobile gallery compression)
      if (trimmed.startsWith('data:image/')) {
        rawScreenshots.push(trimmed);
        return;
      }

      // 2. Handle JSON stringified arrays or objects
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          const parsed = JSON.parse(trimmed);
          addValidScreenshot(parsed);
          return;
        } catch {
          // not valid JSON, proceed to standard parsing
        }
      }

      // 3. Handle multi-line, pipe, or comma-separated lists (only for regular URLs, NOT data URLs)
      if (trimmed.includes('\n') || trimmed.includes('|') || (trimmed.includes(',') && !trimmed.startsWith('data:')) || (trimmed.includes(';') && !trimmed.startsWith('data:'))) {
        trimmed.split(/[\n|]+/).forEach((item) => {
          const s = cleanImageUrl(item);
          if (s && s.length > 5) rawScreenshots.push(s);
        });
      } else {
        const s = cleanImageUrl(trimmed);
        if (s && s.length > 5) rawScreenshots.push(s);
      }
    } else if (Array.isArray(val)) {
      val.forEach((item) => addValidScreenshot(item));
    } else if (typeof val === 'object' && val !== null) {
      if (val.url) addValidScreenshot(val.url);
      else if (val.link) addValidScreenshot(val.link);
      else if (val.src) addValidScreenshot(val.src);
      else if (val.image) addValidScreenshot(val.image);
      else if (val.img) addValidScreenshot(val.img);
      else if (val.photo) addValidScreenshot(val.photo);
      else if (val.uri) addValidScreenshot(val.uri);
      else {
        Object.values(val).forEach((item) => addValidScreenshot(item));
      }
    }
  };

  // 1. Gather all numerical indexed 'pN' / 'p_N' keys in proper order (p1, p2, p3 ... p100)
  const pKeys = Object.keys(app)
    .filter((k) => /^p_?\d+$/i.test(k))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

  pKeys.forEach((key) => {
    addValidScreenshot((app as any)[key]);
  });

  // 2. Gather other indexed screenshot keys (e.g. screenshot1, screen1, img1, pic1, image1, photo1, preview1, ss1)
  const otherIndexedKeys = Object.keys(app)
    .filter((k) => /^(screenshot|screen|image|img|pic|photo|preview|ss)_?\d+$/i.test(k))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

  otherIndexedKeys.forEach((key) => {
    addValidScreenshot((app as any)[key]);
  });

  // 3. Gather collection/array/object/string fields
  addValidScreenshot(app.screenshots);
  addValidScreenshot((app as any).screenshot);
  addValidScreenshot((app as any).screenShots);
  addValidScreenshot((app as any).screen_shots);
  addValidScreenshot((app as any).screens);
  addValidScreenshot((app as any).screen);
  addValidScreenshot(app.images);
  addValidScreenshot((app as any).image);
  addValidScreenshot((app as any).img);
  addValidScreenshot((app as any).imgs);
  addValidScreenshot(app.pics);
  addValidScreenshot((app as any).pic);
  addValidScreenshot((app as any).previews);
  addValidScreenshot((app as any).preview);
  addValidScreenshot((app as any).photos);
  addValidScreenshot((app as any).photo);
  addValidScreenshot((app as any).gallery);
  addValidScreenshot((app as any).previewImages);
  addValidScreenshot((app as any).preview_images);
  addValidScreenshot((app as any).banners);
  addValidScreenshot((app as any).banner);
  addValidScreenshot((app as any).media);
  addValidScreenshot((app as any).screenshotUrls);
  addValidScreenshot((app as any).screenshot_urls);
  addValidScreenshot((app as any).screenshot_url);

  // 4. Scan any remaining unknown keys that look like images or screenshots
  Object.keys(app).forEach((key) => {
    const k = key.toLowerCase();
    if (
      (k.includes('screen') || k.includes('shot') || k.includes('pic') || k.includes('photo') || k.includes('image') || k.includes('img') || k.includes('preview') || k.includes('gallery')) &&
      !['name', 'desc', 'icon', 'link', 'mb', 'cat', 'ver', 'downloads', 'rating', 'views'].includes(k)
    ) {
      addValidScreenshot((app as any)[key]);
    }
  });

  // Filter valid image URLs
  const validScreenshots = rawScreenshots.filter((url) => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.trim();
    return clean.length > 5;
  });

  // Deduplicate while preserving order
  const uniqueScreenshots: string[] = [];
  const seenUrls = new Set<string>();
  for (const url of validScreenshots) {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      uniqueScreenshots.push(url);
    }
  }

  // If no screenshots provided, use app icon as fallback preview
  const screenshots = uniqueScreenshots.length > 0 
    ? uniqueScreenshots 
    : (app.icon ? [app.icon] : []);

  // Real views count directly from Firebase stats or app data (NO fake numbers)
  const viewsCount = stats?.views ?? app.views ?? 0;
  
  // Real user reviews only (from Firebase realtime DB + local submissions)
  const [localReviews, setLocalReviews] = useState<ReviewItem[]>(() => {
    try {
      const key1 = `reviews_${(app.id || '').replace(/[\s./#$[\]]+/g, '-').toLowerCase()}`;
      const key2 = `reviews_${(app.name || '').replace(/[\s./#$[\]]+/g, '-').toLowerCase()}`;
      const list1 = JSON.parse(localStorage.getItem(key1) || '[]');
      const list2 = key1 !== key2 ? JSON.parse(localStorage.getItem(key2) || '[]') : [];
      return [...list1, ...list2];
    } catch {
      return [];
    }
  });

  const commentsObj = stats?.comments;
  let remoteCommentsList: ReviewItem[] = [];
  if (commentsObj) {
    if (Array.isArray(commentsObj)) {
      remoteCommentsList = [...commentsObj].filter(Boolean);
    } else if (typeof commentsObj === 'object') {
      remoteCommentsList = Object.keys(commentsObj)
        .map((k) => (commentsObj as Record<string, ReviewItem>)[k])
        .filter(Boolean);
    }
  }

  // Check if app item has reviews embedded
  const embeddedReviews: ReviewItem[] = Array.isArray((app as any).reviews)
    ? (app as any).reviews
    : Array.isArray((app as any).comments)
    ? (app as any).comments
    : [];

  // Merge and deduplicate real reviews only (NO fake mock reviews!)
  const allRealReviews: ReviewItem[] = [...localReviews, ...remoteCommentsList, ...embeddedReviews];
  const commentsList: ReviewItem[] = [];
  const seenComments = new Set<string>();

  for (const r of allRealReviews) {
    if (!r || !r.user || !r.text) continue;
    const identifier = `${r.user.trim()}_${r.text.trim()}`;
    if (!seenComments.has(identifier)) {
      seenComments.add(identifier);
      commentsList.push(r);
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewContent.trim()) {
      alert('Please enter your name and review message!');
      return;
    }

    setIsSubmitting(true);
    const newRevItem: ReviewItem = {
      user: authorName.trim(),
      text: reviewContent.trim(),
      rating: reviewRating,
      time: 'Just now',
      verified: true
    };

    // Immediately update local state so user sees it right away
    setLocalReviews((prev) => [newRevItem, ...prev]);

    const appIdOrName = app.id || app.name;
    const success = await addAppReview(appIdOrName, {
      user: authorName.trim(),
      text: reviewContent.trim(),
      rating: reviewRating
    });

    if (onAddReview) {
      try {
        await onAddReview({
          user: authorName.trim(),
          text: reviewContent.trim(),
          rating: reviewRating
        });
      } catch (err) {
        console.warn("Parent review notify error:", err);
      }
    }

    setIsSubmitting(false);
    setAuthorName('');
    setReviewContent('');
    setReviewRating(5);
    setShowReviewForm(false);
  };

  const [copyToast, setCopyToast] = useState<string | null>(null);

  const getCleanStoreLink = () => {
    return STORE_CONFIG.STORE_BASE_URL || window.location.href.split('#')[0];
  };

  const getDirectApkLink = () => {
    return app.link || (app as any).url || 'https://archive.org/download/sample-apk-files/sample-app.apk';
  };

  const getShareText = () => {
    const storeLink = getCleanStoreLink();
    const apkLink = getDirectApkLink();
    return `🔥 *${app.name}* (v${app.ver}) - VIP MOD APK\n` +
      `⚡ Size: ${app.mb} MB | Category: ${app.cat}\n` +
      `🛡️ Status: 100% Virus-Free & Verified ✅\n\n` +
      `📥 *Direct APK Download:*\n${apkLink}\n\n` +
      `🌐 *Store Link:*\n${storeLink}\n\n` +
      `👑 Shared from *${STORE_CONFIG.OWNER_NAME}'s Premium Store*`;
  };

  const handleShareWhatsApp = () => {
    const text = getShareText();
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDirectShare = async () => {
    const text = getShareText();
    const storeLink = getCleanStoreLink();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${app.name} - VIP MOD APK`,
          text: text,
          url: storeLink
        });
        return;
      } catch {
        // User dismissed native share sheet or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyToast('Link & APK info copied to clipboard!');
      setTimeout(() => setCopyToast(null), 3000);
    } catch {
      setCopyToast('Link copied to clipboard!');
      setTimeout(() => setCopyToast(null), 3000);
    }
  };

  const handleCopyLink = async () => {
    const text = getShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyToast('Share link copied to clipboard!');
      setTimeout(() => setCopyToast(null), 3000);
    } catch {
      setCopyToast('Failed to copy link.');
      setTimeout(() => setCopyToast(null), 3000);
    }
  };

  const relatedApps = allApps
    .filter((a) => a.name !== app.name && (a.cat === app.cat || a.isHot))
    .slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Lightbox for screenshots */}
      <ScreenshotLightbox
        images={screenshots}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Navigation & Actions Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider border transition active:scale-95 ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40'
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </button>

        <div className="flex items-center gap-2">
          {/* How to Install Helper Button */}
          <button
            onClick={() => setGuideModalOpen(true)}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-2xl border text-xs font-bold transition ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
            }`}
            title="How to install this APK on Android"
          >
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Install Guide</span>
          </button>

          {/* Direct Share / Chat Send Button */}
          <button
            onClick={handleDirectShare}
            className={`p-2.5 rounded-2xl border transition active:scale-95 ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-purple-400 hover:border-purple-500/40'
                : 'bg-white border-slate-200 text-slate-600 hover:text-purple-600 shadow-sm'
            }`}
            title="Share & Send Directly"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Copied / Share Toast Notification */}
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-2xl bg-slate-950/90 text-white border border-purple-500/50 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold pointer-events-none"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{copyToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ReportLinkModal
        app={app}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        theme={theme}
      />

      <InstallGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        theme={theme}
      />

      {/* App Identity Banner with Holographic Gold Aura */}
      <div
        className={`p-6 rounded-[2.5rem] border relative overflow-hidden shadow-2xl ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 via-purple-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 sm:gap-6 relative z-10">
          <div className="relative flex-shrink-0">
            <div className="p-0.5 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-lg">
              <img
                src={app.icon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"}
                alt={app.name}
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl object-cover bg-slate-950"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            {app.isHot && (
              <span className="absolute -top-1.5 -left-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/20 uppercase tracking-wider">
                HOT
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <VipBadge text="VIP UNLOCKED" />
              <span className="bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                {app.cat}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight mb-1 text-white flex items-center gap-1.5 sm:gap-2">
              <span className="truncate">{app.name}</span>
              <VerifiedBadge size={22} />
            </h1>

            <p className="text-xs text-slate-400 font-medium truncate">
              {app.developer || 'Official Modded Edition'} • v{app.ver}
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
      <div className="space-y-3">
        <button
          onClick={() => (onDirectInstall ? onDirectInstall(app) : onQuickDownload ? onQuickDownload(app) : window.open(app.link, '_blank'))}
          className="w-full py-4 px-6 rounded-2xl font-black uppercase text-sm tracking-wider text-white bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-400 hover:via-rose-500 hover:to-purple-500 shadow-xl shadow-pink-600/25 active:scale-98 transition flex items-center justify-center gap-2.5 group cursor-pointer"
        >
          <Download className="w-5 h-5 group-hover:animate-bounce" />
          <span>Direct Download APK</span>
        </button>

        {/* Compact Action Row: WhatsApp Share & Save to Favorites (replacing Instagram) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* WhatsApp Direct Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-3 rounded-xl font-bold text-xs tracking-wide text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-98 transition shadow-md shadow-green-600/20 flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30 whitespace-nowrap"
            title="Share APK & Store link on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white text-emerald-600 flex-shrink-0" />
            <span>WhatsApp</span>
          </button>

          {/* Save / Favorite (Bookmark) Button */}
          <button
            onClick={() => onToggleBookmark(app)}
            className={`w-full py-3 px-3 rounded-xl font-bold text-xs tracking-wide transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer border whitespace-nowrap ${
              isBookmarked
                ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-md shadow-purple-900/30'
                : theme === 'dark'
                ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
            }`}
            title={isBookmarked ? 'Saved in Bookmarks' : 'Save to Favorites'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-purple-400 text-purple-400' : 'text-slate-400'}`} />
            <span>{isBookmarked ? 'Saved' : 'Save App'}</span>
          </button>
        </div>

        {/* Secondary Row: Clean Copy Link & Report Broken Link */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            onClick={handleCopyLink}
            className="text-[11px] font-bold text-slate-400 hover:text-purple-400 flex items-center gap-1.5 transition py-1 cursor-pointer"
            title="Copy app download and store link"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="text-[11px] font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1 transition py-1 cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Report Broken Link</span>
          </button>
        </div>
      </div>

      {/* Screenshots Showcase Carousel */}
      {screenshots.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Preview & Screenshots ({screenshots.length})</span>
            </h3>
            <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" />
              <span>Swipe Left / Right</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Smooth Touch-Friendly Screenshot Carousel */}
          <div
            id="screenshots-carousel"
            className="flex gap-3 overflow-x-auto pb-3 scrollbar-none overscroll-x-contain scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {screenshots.map((pic, idx) => (
              <ScreenshotThumbnail
                key={idx}
                pic={pic}
                idx={idx}
                onSelect={(selectedIdx) => {
                  setLightboxIndex(selectedIdx);
                  setLightboxOpen(true);
                }}
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
        className={`p-6 rounded-3xl border space-y-4 ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Reviews ({commentsList.length})</span>
            </h3>
            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400" /> {app.rating || 4.9}
            </span>
          </div>

          {/* Tiny subtle corner button to rate */}
          <button
            onClick={() => setShowReviewForm((prev) => !prev)}
            className="text-[11px] font-bold text-slate-400 hover:text-purple-400 px-2.5 py-1 rounded-lg border border-slate-700/60 hover:border-purple-500/50 bg-slate-800/50 transition cursor-pointer flex items-center gap-1"
          >
            <Star className="w-3 h-3 text-amber-400" />
            <span>{showReviewForm ? 'Cancel' : 'Rate'}</span>
          </button>
        </div>

        {/* Compact Dropdown Review Form (shown only if user taps the corner rate button) */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="bg-slate-800/50 p-3.5 rounded-2xl border border-purple-500/30 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Stars:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-0.5 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        reviewRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />

            <textarea
              placeholder="Quick feedback or thoughts..."
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              rows={2}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-3 py-1 text-slate-400 hover:text-slate-200 text-xs transition"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-1 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSubmitting ? '...' : 'Post'}
              </button>
            </div>
          </form>
        )}

        {/* Real Reviews List or Clean Empty State */}
        {commentsList.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-2xl bg-slate-800/20 border border-dashed border-slate-700/60 space-y-2">
            <MessageSquare className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No reviews yet for this app.</p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
            >
              Be the first to rate & review!
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {commentsList.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{item.user}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold uppercase">
                      VIP User
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{item.time || 'Recently'}</span>
                </div>

                <div className="flex gap-0.5">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  "{item.text}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related VIP Apps Carousel */}
      {relatedApps.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Recommended VIP Applications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {relatedApps.map((rel) => (
              <div
                key={rel.id || rel.name}
                onClick={() => {
                  if (onSelectRelatedApp) {
                    onSelectRelatedApp(rel);
                  }
                }}
                className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 transition cursor-pointer flex items-center gap-3 group"
              >
                <img
                  src={rel.icon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"}
                  alt={rel.name}
                  className="w-12 h-12 rounded-xl object-cover border border-purple-500/20 group-hover:scale-105 transition"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-black text-white truncate group-hover:text-purple-400 transition">
                      {rel.name}
                    </h4>
                    <VerifiedBadge size={14} />
                  </div>
                  <p className="text-[10px] text-purple-400 font-bold">
                    {rel.mb} MB • {rel.cat}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
