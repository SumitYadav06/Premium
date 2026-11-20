import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  runTransaction,
  push,
  type Database,
} from 'firebase/database';
import type { AppItem, AppStats, ReviewItem, StoreStatus } from '../types';

// Firebase config — same project (premium-store-24880) as before, reused verbatim.
const _k = [
  "QUl6YVN5QWNObmx3RWZFUG55NnJTY3RMYVJET3N3ZlBlU05nR3NZ",
  "cHJlbWl1bS1zdG9yZS0yNDg4MC5maXJlYmFzZWFwcC5jb20=",
  "cHJlbWl1bS1zdG9yZS0yNDg4MA==",
  "cHJlbWl1bS1zdG9yZS0yNDg4MC1kZWZhdWx0LXJ0ZGIuZmlyZWJhc2Vpby5jb20="
];

const dc = (v: string) => {
  try {
    return atob(v);
  } catch {
    return '';
  }
};

let app: FirebaseApp | null = null;
let db: Database | null = null;

try {
  const firebaseConfig = {
    apiKey: dc(_k[0]),
    authDomain: dc(_k[1]),
    projectId: dc(_k[2]),
    databaseURL: 'https://' + dc(_k[3]),
  };
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.warn('Firebase initialization skipped:', e);
}

export function getAppKey(appNameOrId: string): string {
  if (!appNameOrId) return '';
  return appNameOrId.trim().replace(/[\s./#$[\]]+/g, '-').toLowerCase();
}

/** Live subscription: `apps_list` + `stats`. Emits the cached list first so the store never flashes empty. */
export function subscribeToApps(
  onApps: (apps: AppItem[]) => void,
  onStats: (stats: Record<string, AppStats>) => void,
): () => void {
  try {
    const cached = localStorage.getItem('premium_store_cached_apps');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) onApps(parsed);
    }
  } catch {
    /* no cache — live data will arrive below */
  }

  if (!db) return () => {};

  const unsubApps = onValue(
    ref(db, 'apps_list'),
    (snapshot) => {
      if (!snapshot.exists()) return;
      const val = snapshot.val();
      const list: AppItem[] = Array.isArray(val)
        ? val.filter(Boolean)
        : Object.keys(val).map((k) => ({ ...val[k], id: val[k].id || k }));
      if (list.length > 0) {
        onApps(list);
        try {
          localStorage.setItem('premium_store_cached_apps', JSON.stringify(list));
        } catch {
          /* storage full/blocked — ignore */
        }
      }
    },
    (err) => console.warn('Apps read fallback:', err),
  );

  const unsubStats = onValue(
    ref(db, 'stats'),
    (snapshot) => {
      if (snapshot.exists()) onStats(snapshot.val() || {});
    },
    (err) => console.warn('Stats read error:', err),
  );

  return () => {
    unsubApps();
    unsubStats();
  };
}

/** Live subscription: `store_status` (kill switch / announcement). */
export function subscribeToStoreStatus(onStatus: (s: StoreStatus | null) => void): () => void {
  if (!db) return () => {};
  return onValue(
    ref(db, 'store_status'),
    (snapshot) => {
      onStatus(snapshot.exists() ? (snapshot.val() as StoreStatus) : null);
    },
    () => onStatus(null),
  );
}

export async function incrementAppView(appNameOrId: string): Promise<void> {
  if (!appNameOrId || !db) return;
  try {
    await runTransaction(ref(db, `stats/${getAppKey(appNameOrId)}/views`), (c) => (c || 0) + 1);
  } catch (e) {
    console.warn('View increment fallback:', e);
  }
}

export async function incrementAppDownload(appNameOrId: string): Promise<void> {
  if (!appNameOrId || !db) return;
  try {
    await runTransaction(ref(db, `stats/${getAppKey(appNameOrId)}/downloads`), (c) => (c || 0) + 1);
  } catch (e) {
    console.warn('Download increment fallback:', e);
  }
}

/** Review -> `stats/<slug>/comments` (push). Returns false only when the input is invalid. */
export async function addAppReview(
  appNameOrId: string,
  review: { user: string; text: string; rating: number },
): Promise<boolean> {
  if (!appNameOrId || !review.user || !review.text) return false;
  const key = getAppKey(appNameOrId);
  const newReview: ReviewItem = {
    user: review.user.trim(),
    text: review.text.trim(),
    rating: review.rating || 5,
    time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    verified: true,
  };

  if (db) {
    try {
      await push(ref(db, `stats/${key}/comments`), newReview);
    } catch (e) {
      console.warn('Firebase post review failed:', e);
    }
  }

  // Local backup so the review shows instantly on this device.
  try {
    const localKey = `reviews_${key}`;
    const stored: ReviewItem[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    stored.unshift(newReview);
    localStorage.setItem(localKey, JSON.stringify(stored));
  } catch {
    /* ignore */
  }
  return true;
}

/** App request -> `requests` collection. */
export async function submitAppRequest(request: {
  appName: string;
  category?: string;
  note?: string;
  requesterName?: string;
}): Promise<boolean> {
  if (!request.appName?.trim()) return false;
  const newReq = {
    ...request,
    appName: request.appName.trim(),
    id: `req_${Date.now()}`,
    createdAt: Date.now(),
    votes: 1,
    status: 'pending' as const,
  };

  if (db) {
    try {
      await set(ref(db, `requests/${newReq.id}`), newReq);
      return true;
    } catch (e) {
      console.warn('Firebase submit request error:', e);
    }
  }

  try {
    const list = JSON.parse(localStorage.getItem('premium_store_user_requests') || '[]');
    list.unshift(newReq);
    localStorage.setItem('premium_store_user_requests', JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

/** Broken-link report -> `broken_reports` collection. */
export async function submitBrokenLinkReport(report: {
  appName: string;
  appId?: string;
  reason?: string;
}): Promise<boolean> {
  if (!report.appName?.trim()) return false;
  const newReport = {
    ...report,
    appName: report.appName.trim(),
    id: `report_${Date.now()}`,
    reportedAt: Date.now(),
  };

  if (db) {
    try {
      await set(ref(db, `broken_reports/${newReport.id}`), newReport);
      return true;
    } catch (e) {
      console.warn('Firebase broken report error:', e);
    }
  }

  try {
    const list = JSON.parse(localStorage.getItem('premium_store_broken_reports') || '[]');
    list.unshift(newReport);
    localStorage.setItem('premium_store_broken_reports', JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}
