import type { FirebaseApp } from 'firebase/app';
import type { Database } from 'firebase/database';
import type { Auth, User } from 'firebase/auth';
import { AppItem, AppStats, ReviewItem, StoreStatus } from '../types';

// Encrypted keys from user app
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

// Firebase LAZY load: firebase/app + database + auth (~338 kB, 72 kB gzip)
// pehle paint se pehle NAHI aate. Pehla bundle ab sirf app + React +
// motion hai; Firebase pehli zaroorat par (subscribe / tap) background
// me load hota hai. Isse store pehli baar turant khulta hai.
interface FbHandles {
  app: FirebaseApp;
  db: Database;
  auth: Auth;
  dbFns: typeof import('firebase/database');
  authFns: typeof import('firebase/auth');
}

let fbPromise: Promise<FbHandles | null> | null = null;

function ensureFirebase(): Promise<FbHandles | null> {
  if (fbPromise) return fbPromise;
  fbPromise = (async (): Promise<FbHandles | null> => {
    try {
      const appMod = await import('firebase/app');
      const dbMod = await import('firebase/database');
      const authMod = await import('firebase/auth');
      const firebaseConfig = {
        apiKey: dc(_k[0]),
        authDomain: dc(_k[1]),
        projectId: dc(_k[2]),
        databaseURL: 'https://' + dc(_k[3])
      };
      const app: FirebaseApp = appMod.getApps().length
        ? appMod.getApps()[0]
        : appMod.initializeApp(firebaseConfig);
      const handles: FbHandles = {
        app,
        db: dbMod.getDatabase(app),
        auth: authMod.getAuth(app),
        dbFns: dbMod,
        authFns: authMod
      };
      cachedAuth = handles.auth;
      return handles;
    } catch (e) {
      console.warn('Firebase initialization skipped/fallback enabled:', e);
      return null;
    }
  })();
  return fbPromise;
}

// Admin sign-in ke liye auth handle — lazy, isliye sync getter null de
// sakta hai jab tak Firebase load na hua ho (AdminModal lazy chunk hai,
// uske khulne tak Firebase hamesha load ho chuka hota hai).
let cachedAuth: Auth | null = null;

/** Sirf ye Google account Admin hai — Rules me bhi yahi email check hota hai. */
export const ADMIN_EMAIL = 'a1mausy06@gmail.com';

/** Admin Google sign-in — Admin Panel kholne ke liye. Sirf ADMIN_EMAIL wala account chalega. */
export async function signInAdminWithGoogle(): Promise<boolean> {
  const fb = await ensureFirebase();
  if (!fb) return false;
  const auth = fb.auth;
  try {
    const provider = new fb.authFns.GoogleAuthProvider();
    const result = await fb.authFns.signInWithPopup(auth, provider);
    if (result.user?.email === ADMIN_EMAIL) return true;
    // Galat Google account se sign-in hua — turant sign-out karo.
    await fb.authFns.signOut(auth).catch(() => {});
    return false;
  } catch (e) {
    console.warn('Admin Google sign-in failed:', e);
    return false;
  }
}

export function getAdminUser(): User | null {
  return cachedAuth?.currentUser || null;
}

export function isAdminSignedIn(): boolean {
  return getAdminUser()?.email === ADMIN_EMAIL;
}

export function onAdminAuthChange(cb: (user: User | null) => void): () => void {
  let cancelled = false;
  let unsub: (() => void) | null = null;
  void ensureFirebase().then((fb) => {
    if (cancelled || !fb) {
      if (!cancelled && !fb) cb(null);
      return;
    }
    unsub = fb.authFns.onAuthStateChanged(fb.auth, cb);
  });
  return () => {
    cancelled = true;
    if (unsub) unsub();
  };
}

export async function signOutAdmin(): Promise<void> {
  const fb = await ensureFirebase();
  if (!fb) return;
  await fb.authFns.signOut(fb.auth).catch(() => {});
}

export function getAppKey(appNameOrId: string): string {
  if (!appNameOrId) return '';
  return appNameOrId.trim().replace(/[\s./#$[\]]+/g, '-').toLowerCase();
}

/** Lazy Firebase database handles — har async function isse shuru hoti
 *  hai, taaki Firebase tabhi load ho jab uski zaroorat ho. */
async function dbHandles(): Promise<{
  db: Database;
  ref: typeof import('firebase/database').ref;
  set: typeof import('firebase/database').set;
  get: typeof import('firebase/database').get;
  runTransaction: typeof import('firebase/database').runTransaction;
  push: typeof import('firebase/database').push;
} | null> {
  const fb = await ensureFirebase();
  if (!fb) return null;
  return {
    db: fb.db,
    ref: fb.dbFns.ref,
    set: fb.dbFns.set,
    get: fb.dbFns.get,
    runTransaction: fb.dbFns.runTransaction,
    push: fb.dbFns.push
  };
}

export function subscribeToApps(
  onApps: (apps: AppItem[]) => void,
  onStats: (stats: Record<string, AppStats>) => void
) {
  // 1. Immediately emit cached real apps to eliminate flash of dummy/empty apps
  try {
    const cached = localStorage.getItem('premium_store_cached_apps');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onApps(parsed);
      }
    }
  } catch (e) {}

  let cancelled = false;
  let unsubApps: (() => void) | null = null;
  let unsubStats: (() => void) | null = null;

  void ensureFirebase().then((fb) => {
    if (cancelled) return;
    if (!fb) {
      try {
        const custom = localStorage.getItem('premium_store_custom_apps');
        if (custom) {
          const parsed = JSON.parse(custom);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onApps(parsed);
          }
        }
      } catch (e) {}
      return;
    }
    const { db, dbFns } = fb;
    const { ref, onValue } = dbFns;
    const appsRef = ref(db, 'apps_list');
    const statsRef = ref(db, 'stats');

    unsubApps = onValue(
      appsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: AppItem[] = Array.isArray(val)
            ? val.filter(Boolean)
            : Object.keys(val).map((k) => ({ ...val[k], id: val[k].id || k }));
          if (list.length > 0) {
            onApps(list);
            try {
              localStorage.setItem('premium_store_cached_apps', JSON.stringify(list));
            } catch (e) {}
          }
        }
      },
      (err) => {
        console.warn("Apps read fallback:", err);
      }
    );

    // Stats har chhote change (ek view/download) par poora snapshot
    // dobara bhejte hain — har baar poora grid re-render hota tha.
    // Ab zyada se zyada 800ms me ek baar update (trailing) — UI
    // utna hi fresh, par re-render bahut kam.
    let statsTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingStats: Record<string, AppStats> | null = null;
    unsubStats = onValue(
      statsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          pendingStats = snapshot.val() || {};
          if (!statsTimer) {
            statsTimer = setTimeout(() => {
              statsTimer = null;
              if (pendingStats) onStats(pendingStats);
              pendingStats = null;
            }, 800);
          }
        }
      },
      (err) => {
        console.warn("Stats read error:", err);
      }
    );
  });

  return () => {
    cancelled = true;
    if (unsubApps) unsubApps();
    if (unsubStats) unsubStats();
  };
}

// ---- Unique device + unique counting ----
// Har device (phone/browser) ki ek stable ID — localStorage me ek baar banti hai, phir wahi rehti hai.
// Views/downloads isi se ek device = ek count hote hain. Koi login ya personal data nahi liya jata.
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem('aj_device_id');
    if (!id) {
      const c = (window as any).crypto;
      id = c && c.randomUUID ? c.randomUUID() : 'aj-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('aj_device_id', id);
    }
    return id;
  } catch {
    return 'unknown';
  }
}

// Is session me pehle se gina ja chuka flag (double-tap se double count rokne ke liye)
const countedFlags = new Set<string>();

function alreadyCounted(flag: string): boolean {
  if (countedFlags.has(flag)) return true;
  countedFlags.add(flag);
  try {
    return !!localStorage.getItem(flag);
  } catch {
    return false;
  }
}

function markCounted(flag: string) {
  try {
    localStorage.setItem(flag, '1');
  } catch {}
}

// Roz ka visitor ping — ek device se ek din me sirf ek baar.
// Isse Admin me dikhta hai: aaj / pichhle 7 din / pichhle 30 din me kitne alag log aaye.
export async function recordDailyVisit() {
  const h = await dbHandles();
  if (!h) return;
  const { db, ref, set } = h;
  try {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (localStorage.getItem(`aj_visit_${today}`)) return;
    localStorage.setItem(`aj_visit_${today}`, '1');
    await set(ref(db, `visitors/${today}/${getDeviceId()}`), Date.now());
  } catch (e) {
    console.warn('Visit ping failed', e);
  }
}

// App ke screenshots alag node me hain (app_shots/<key>) — list halki rahe,
// detail khulne par hi screenshots load hote hain. Isse store turant khulta hai.
export async function getAppShots(appNameOrId: string): Promise<string[]> {
  if (!appNameOrId) return [];
  const h = await dbHandles();
  if (!h) return [];
  const { db, ref, get } = h;
  try {
    const snap = await get(ref(db, `app_shots/${getAppKey(appNameOrId)}`));
    const val = snap.val();
    if (!val || typeof val !== 'object') return [];
    const out: string[] = [];
    Object.keys(val)
      .filter((k) => /^p_?\d+$/i.test(k))
      .sort((a, b) => (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0))
      .forEach((k) => {
        if (typeof val[k] === 'string' && val[k]) out.push(val[k]);
      });
    return out;
  } catch (e) {
    console.warn('App shots fetch failed', e);
    return [];
  }
}

export async function incrementAppView(appNameOrId: string) {
  if (!appNameOrId) return;
  const key = getAppKey(appNameOrId);

  // Ek device se ek app ka view sirf EK baar gina jata hai — baar-baar open karne par nahi badhta.
  const flag = `aj_viewed_${key}`;
  if (alreadyCounted(flag)) return;

  const h = await dbHandles();
  if (h) {
    const { db, ref, runTransaction } = h;
    try {
      const viewRef = ref(db, `stats/${key}/views`);
      await runTransaction(viewRef, (current) => (current || 0) + 1);
      markCounted(flag);
    } catch (e) {
      countedFlags.delete(flag);
      console.warn("View increment fallback", e);
    }
  }
}

export async function incrementAppDownload(appNameOrId: string) {
  if (!appNameOrId) return;
  const key = getAppKey(appNameOrId);

  // Ek device se ek app ka download sirf EK baar gina jata hai — dobara download karne par nahi badhta.
  const flag = `aj_dl_${key}`;
  if (alreadyCounted(flag)) return;

  const h = await dbHandles();
  if (h) {
    const { db, ref, runTransaction } = h;
    try {
      const dlRef = ref(db, `stats/${key}/downloads`);
      await runTransaction(dlRef, (current) => (current || 0) + 1);
      markCounted(flag);
    } catch (e) {
      countedFlags.delete(flag);
      console.warn("Download increment fallback", e);
    }
  }
}

export async function addAppReview(appNameOrId: string, review: { user: string; text: string; rating: number }) {
  if (!appNameOrId || !review.user || !review.text) return false;
  const key = getAppKey(appNameOrId);

  const newReview: ReviewItem = {
    user: review.user.trim(),
    text: review.text.trim(),
    rating: review.rating || 5,
    time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    verified: true
  };

  const h = await dbHandles();
  if (h) {
    const { db, ref, push } = h;
    try {
      const commentsRef = ref(db, `stats/${key}/comments`);
      await push(commentsRef, newReview);
    } catch (e) {
      console.warn("Firebase post review failed:", e);
    }
  }

  // Local storage backup for instant local feedback
  try {
    const localKey = `reviews_${key}`;
    const stored = JSON.parse(localStorage.getItem(localKey) || '[]');
    stored.unshift(newReview);
    localStorage.setItem(localKey, JSON.stringify(stored));
    return true;
  } catch (e) {
    console.error("Local review store error:", e);
    return true;
  }
}

export async function saveAppToStore(appItem: AppItem): Promise<boolean> {
  if (!appItem.name) return false;
  // Admin-only: bina Admin Google sign-in ke Firebase me save nahi hoga.
  if (!isAdminSignedIn()) return false;
  const appId = appItem.id || `app_${Date.now()}`;
  const appToSave: AppItem = {
    ...appItem,
    id: appId,
    downloads: appItem.downloads || 1200,
    rating: appItem.rating || 4.9
  };

  const h = await dbHandles();
  if (h) {
    const { db, ref, set } = h;
    try {
      const appRef = ref(db, `apps_list/${appId}`);
      await set(appRef, appToSave);
      return true;
    } catch (e) {
      console.warn("Firebase save app failed:", e);
    }
  }

  // Local fallback
  try {
    const localApps = JSON.parse(localStorage.getItem('premium_store_custom_apps') || '[]');
    const existingIndex = localApps.findIndex((a: AppItem) => a.id === appId || a.name === appToSave.name);
    if (existingIndex >= 0) {
      localApps[existingIndex] = appToSave;
    } else {
      localApps.unshift(appToSave);
    }
    localStorage.setItem('premium_store_custom_apps', JSON.stringify(localApps));
    return true;
  } catch (e) {
    console.error("Local save app error:", e);
    return false;
  }
}

export async function deleteAppFromStore(appIdOrName: string): Promise<boolean> {
  if (!appIdOrName) return false;
  // Admin-only: bina Admin Google sign-in ke Firebase se delete nahi hoga.
  if (!isAdminSignedIn()) return false;

  const h = await dbHandles();
  if (h) {
    const { db, ref, set } = h;
    try {
      const appRef = ref(db, `apps_list/${appIdOrName}`);
      await set(appRef, null);
    } catch (e) {
      console.warn("Firebase delete app error:", e);
    }
  }

  // Local fallback
  try {
    const localApps = JSON.parse(localStorage.getItem('premium_store_custom_apps') || '[]');
    const filtered = localApps.filter((a: AppItem) => a.id !== appIdOrName && a.name !== appIdOrName);
    localStorage.setItem('premium_store_custom_apps', JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error("Local delete app error:", e);
    return false;
  }
}

export async function submitAppRequest(request: {
  appName: string;
  category?: string;
  note?: string;
  requesterName?: string;
  // Rewarded video ad dekhkar boost ki gayi request (opt-in, admin ko dikhega).
  boosted?: boolean;
}): Promise<boolean> {
  if (!request.appName) return false;
  const newReq = {
    ...request,
    id: `req_${Date.now()}`,
    createdAt: Date.now(),
    votes: 1,
    status: 'pending'
  };

  const h = await dbHandles();
  if (h) {
    const { db, ref, set } = h;
    try {
      const reqRef = ref(db, `requests/${newReq.id}`);
      await set(reqRef, newReq);
      return true;
    } catch (e) {
      console.warn("Firebase submit request error:", e);
    }
  }

  // Local storage fallback
  try {
    const list = JSON.parse(localStorage.getItem('premium_store_user_requests') || '[]');
    list.unshift(newReq);
    localStorage.setItem('premium_store_user_requests', JSON.stringify(list));
    return true;
  } catch (e) {
    console.error("Local request submit error:", e);
    return false;
  }
}

export async function submitBrokenLinkReport(report: {
  appName: string;
  appId?: string;
  reason?: string;
}): Promise<boolean> {
  if (!report.appName) return false;
  const newReport = {
    ...report,
    id: `report_${Date.now()}`,
    reportedAt: Date.now()
  };

  const h = await dbHandles();
  if (h) {
    const { db, ref, set } = h;
    try {
      const repRef = ref(db, `broken_reports/${newReport.id}`);
      await set(repRef, newReport);
      return true;
    } catch (e) {
      console.warn("Firebase broken report error:", e);
    }
  }

  try {
    const list = JSON.parse(localStorage.getItem('premium_store_broken_reports') || '[]');
    list.unshift(newReport);
    localStorage.setItem('premium_store_broken_reports', JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
}


/** Admin save — purane saveAppToStore se alag, ye sach batata hai ki save kahan hua:
 *  'firebase' = server par gaya (sabko dikhega), 'local' = sirf is phone par, false = fail */
export async function saveAppStrict(appItem: AppItem): Promise<'firebase' | 'local' | false> {
  if (!appItem.name) return false;
  // Admin-only: bina Admin Google sign-in ke Firebase me save nahi hoga.
  if (!isAdminSignedIn()) return false;
  const appId = appItem.id || `app_${Date.now()}`;
  const appToSave: AppItem = {
    ...appItem,
    id: appId,
    downloads: appItem.downloads || 0,
    rating: appItem.rating || 4.8
  };

  const h = await dbHandles();
  if (h) {
    const { db, ref, set } = h;
    try {
      const appRef = ref(db, `apps_list/${appId}`);
      await set(appRef, appToSave);
      return 'firebase';
    } catch (e) {
      console.warn('Firebase strict save failed:', e);
    }
  }

  try {
    const localApps = JSON.parse(localStorage.getItem('premium_store_custom_apps') || '[]');
    const idx = localApps.findIndex((a: AppItem) => a.id === appId);
    if (idx >= 0) localApps[idx] = appToSave;
    else localApps.unshift(appToSave);
    localStorage.setItem('premium_store_custom_apps', JSON.stringify(localApps));
    return 'local';
  } catch (e) {
    return false;
  }
}

/** Admin PIN (SHA-256 hash bankar Firebase admin_config me rehta hai) */
export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getAdminPinHash(): Promise<string | null> {
  const h = await dbHandles();
  if (!h) return null;
  const { db, ref, get } = h;
  try {
    const snap = await get(ref(db, 'admin_config/pinHash'));
    const v = snap.val();
    return typeof v === 'string' && v ? v : null;
  } catch (e) {
    return null;
  }
}

export async function setAdminPinHash(hash: string): Promise<boolean> {
  // Admin-only: bina Admin Google sign-in ke PIN hash nahi badlega.
  if (!isAdminSignedIn()) return false;
  const h = await dbHandles();
  if (!h) return false;
  const { db, ref, set } = h;
  try {
    await set(ref(db, 'admin_config/pinHash'), hash);
    return true;
  } catch (e) {
    return false;
  }
}

/** Kill switch / announcement — Admin Panel se store_status badalna */
export async function setStoreStatus(status: StoreStatus): Promise<boolean> {
  // Admin-only: bina Admin Google sign-in ke store status nahi badlega.
  if (!isAdminSignedIn()) return false;
  const h = await dbHandles();
  if (!h) return false;
  const { db, ref, set } = h;
  try {
    await set(ref(db, 'store_status'), status);
    return true;
  } catch (e) {
    console.error('Store status save failed:', e);
    return false;
  }
}
