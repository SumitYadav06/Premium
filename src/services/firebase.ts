import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, Database, DatabaseReference, runTransaction, push } from 'firebase/database';
import { AppItem, AppStats, ReviewItem, StoreStatus } from '../types';
import { INITIAL_APPS } from '../data/mockApps';

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

let app: FirebaseApp | null = null;
let db: Database | null = null;

try {
  const firebaseConfig = {
    apiKey: dc(_k[0]),
    authDomain: dc(_k[1]),
    projectId: dc(_k[2]),
    databaseURL: "https://" + dc(_k[3])
  };

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getDatabase(app);
} catch (e) {
  console.warn("Firebase initialization skipped/fallback enabled:", e);
}

export function subscribeToApps(
  onApps: (apps: AppItem[]) => void,
  onStats: (stats: Record<string, AppStats>) => void,
  onStatus: (status: StoreStatus) => void
) {
  if (!db) {
    onApps(INITIAL_APPS);
    onStatus({ active: true, msg: "Store is Active", link: "#" });
    return () => {};
  }

  const appsRef = ref(db, 'apps_list');
  const statsRef = ref(db, 'stats');
  const statusRef = ref(db, 'store_status');

  const unsubApps = onValue(
    appsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: AppItem[] = Array.isArray(val)
          ? val.filter(Boolean)
          : Object.keys(val).map((k) => ({ ...val[k], id: val[k].id || k }));
        if (list.length > 0) {
          onApps(list);
        } else {
          onApps(INITIAL_APPS);
        }
      } else {
        onApps(INITIAL_APPS);
      }
    },
    (err) => {
      console.warn("Apps read fallback:", err);
      onApps(INITIAL_APPS);
    }
  );

  const unsubStats = onValue(
    statsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onStats(snapshot.val() || {});
      }
    },
    (err) => {
      console.warn("Stats read error:", err);
    }
  );

  const unsubStatus = onValue(
    statusRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onStatus(snapshot.val());
      } else {
        onStatus({ active: true, msg: "Welcome to Premium Store", link: "#" });
      }
    },
    (err) => {
      console.warn("Store status error:", err);
      onStatus({ active: true, msg: "Welcome to Premium Store", link: "#" });
    }
  );

  return () => {
    unsubApps();
    unsubStats();
    unsubStatus();
  };
}

export async function incrementAppView(appName: string) {
  if (!appName) return;
  const key = appName.replace(/\s+/g, '-').toLowerCase();
  
  if (db) {
    try {
      const viewRef = ref(db, `stats/${key}/views`);
      await runTransaction(viewRef, (current) => (current || 0) + 1);
    } catch (e) {
      console.warn("View increment fallback", e);
    }
  }
}

export async function incrementAppDownload(appName: string) {
  if (!appName) return;
  const key = appName.replace(/\s+/g, '-').toLowerCase();
  
  if (db) {
    try {
      const dlRef = ref(db, `stats/${key}/downloads`);
      await runTransaction(dlRef, (current) => (current || 0) + 1);
    } catch (e) {
      console.warn("Download increment fallback", e);
    }
  }
}

export async function addAppReview(appName: string, review: { user: string; text: string; rating: number }) {
  if (!appName || !review.user || !review.text) return false;
  const key = appName.replace(/\s+/g, '-').toLowerCase();

  const newReview: ReviewItem = {
    user: review.user,
    text: review.text,
    rating: review.rating,
    time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    verified: true
  };

  if (db) {
    try {
      const commentsRef = ref(db, `stats/${key}/comments`);
      await push(commentsRef, newReview);
      return true;
    } catch (e) {
      console.warn("Firebase post review failed:", e);
    }
  }

  // Local fallback
  try {
    const localKey = `reviews_${key}`;
    const stored = JSON.parse(localStorage.getItem(localKey) || '[]');
    stored.unshift(newReview);
    localStorage.setItem(localKey, JSON.stringify(stored));
    return true;
  } catch (e) {
    console.error("Local review store error:", e);
    return false;
  }
}
