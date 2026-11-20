import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Search, SearchX, X } from 'lucide-react';
import type { AppItem, AppStats, StoreStatus } from './types';
import {
  getAppKey,
  incrementAppView,
  subscribeToApps,
  subscribeToStoreStatus,
} from './services/firebase';
import { fetchReleaseApps } from './services/githubApps';
import { STORE_CONFIG } from './config';
import { AppCard } from './components/AppCard';
import { AppDetail } from './components/AppDetail';
import { BottomDock } from './components/BottomDock';
import { CategoryPills } from './components/CategoryPills';
import { RequestModal } from './components/RequestModal';
import { Top10Rail } from './components/Top10Rail';

function downloadsOf(a: AppItem, stats: Record<string, AppStats>): number {
  return (
    stats[a.id]?.downloads ??
    stats[getAppKey(a.id)]?.downloads ??
    stats[getAppKey(a.name)]?.downloads ??
    a.downloads ??
    0
  );
}

export default function App() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [stats, setStats] = useState<Record<string, AppStats>>({});
  const [releaseApps, setReleaseApps] = useState<AppItem[]>([]);
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<AppItem | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const top10Ref = useRef<HTMLDivElement>(null);

  // Firebase live data: apps_list + stats (+ store_status)
  useEffect(() => {
    const unsub = subscribeToApps(
      (list) => {
        setApps(list);
        setLoaded(true);
      },
      (s) => setStats(s),
    );
    const unsubStatus = subscribeToStoreStatus(setStoreStatus);
    return () => {
      unsub();
      unsubStatus();
    };
  }, []);

  // GitHub Releases se auto-listed apps (10 min cache, service ke andar)
  useEffect(() => {
    let alive = true;
    fetchReleaseApps()
      .then((list) => {
        if (alive) setReleaseApps(list);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Merge: Firebase first; same link dono jagah ho to Firebase wala jeetega.
  const allApps = useMemo(() => {
    const fbLinks = new Set(apps.map((a) => a?.link).filter(Boolean));
    const ghosts = releaseApps.filter((g) => g && g.link && !fbLinks.has(g.link));
    return [...apps, ...ghosts];
  }, [apps, releaseApps]);

  const ranked = useMemo(
    () =>
      [...allApps]
        .filter((a) => a && a.name)
        .map((app) => ({ app, downloads: downloadsOf(app, stats) }))
        .sort((x, y) => y.downloads - x.downloads),
    [allApps, stats],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of allApps) {
      if (a?.cat) c[a.cat] = (c[a.cat] || 0) + 1;
    }
    return c;
  }, [allApps]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allApps.filter((a) => {
      if (!a?.name) return false;
      if (category && a.cat !== category) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        (a.desc || '').toLowerCase().includes(q) ||
        (a.cat || '').toLowerCase().includes(q)
      );
    });
  }, [allApps, query, category]);

  const openApp = (app: AppItem) => {
    setSelected(app);
    void incrementAppView(app.id);
  };

  const goHome = () => {
    setSelected(null);
    setQuery('');
    setCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goTop10 = () => {
    setSelected(null);
    top10Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Search submit: keyboard band karo (mobile) — form submit par input blur.
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchRef.current?.blur();
    (document.activeElement as HTMLElement | null)?.blur?.();
  };

  const storeClosed = storeStatus !== null && storeStatus.active === false;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header — top icon STATIC, koi rotation/animation nahi */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <img
            src={STORE_CONFIG.STORE_APP_ICON}
            alt="Apna Jugaad logo"
            width={44}
            height={44}
            className="w-11 h-11 rounded-xl object-cover bg-slate-800 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-lg leading-tight truncate">{STORE_CONFIG.STORE_NAME}</p>
            <p className="text-xs text-slate-400 leading-tight truncate">{STORE_CONFIG.STORE_TAGLINE}</p>
          </div>
          <a
            href={STORE_CONFIG.STORE_APP_APK_URL}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-2 text-xs font-bold hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 shrink-0"
          >
            <Download className="w-4 h-4" />
            Store APK
          </a>
        </div>

        {/* Search — form submit par keyboard close hota hai */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <form onSubmit={submitSearch} role="search">
            <div className="flex items-center gap-2 rounded-2xl bg-white/[0.06] border border-white/10 px-3 focus-within:border-violet-400">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Apps, games search karo…"
                aria-label="Search apps"
                enterKeyHint="search"
                className="flex-1 min-w-0 bg-transparent py-3 text-sm placeholder:text-slate-500 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-white focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
              <button
                type="submit"
                className="text-xs font-bold text-violet-300 hover:text-white px-1 focus:outline-none"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </header>

      {storeStatus && storeStatus.active && storeStatus.msg ? (
        <div className="bg-violet-600/20 border-b border-violet-500/30 px-4 py-2 text-center text-sm text-violet-200">
          {storeStatus.msg}
        </div>
      ) : null}

      {storeClosed ? (
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-2xl font-extrabold">Store abhi band hai</p>
          <p className="text-slate-400 mt-2">{storeStatus?.msg || 'Jald wapas aayenge.'}</p>
          {storeStatus?.link ? (
            <a
              href={storeStatus.link}
              className="inline-block mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold"
            >
              Aur jaankari
            </a>
          ) : null}
        </main>
      ) : (
        <main className="max-w-2xl mx-auto px-4 pt-4 pb-28">
          <CategoryPills selected={category} counts={counts} onSelect={setCategory} />

          <div ref={top10Ref} className="scroll-mt-32">
            <Top10Rail ranked={ranked} onSelect={openApp} />
          </div>

          <section aria-label="All apps" className="mt-7">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-lg font-extrabold">
                {category || (query ? `Results for “${query.trim()}”` : 'All Apps')}
              </h2>
              <span className="text-xs text-slate-400">{visible.length} apps</span>
            </div>

            {!loaded && visible.length === 0 ? (
              <p className="text-sm text-slate-400 mt-4 px-1">Store khul raha hai…</p>
            ) : visible.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 mt-3 text-center">
                <SearchX className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="font-bold mt-2">Kuch nahi mila</p>
                <p className="text-sm text-slate-400 mt-1">
                  Dusra keyword try karo ya category badlo — ya app request bhej do.
                </p>
                <button
                  type="button"
                  onClick={() => setRequestOpen(true)}
                  className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold hover:bg-violet-500"
                >
                  App Request karo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {visible.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    downloads={downloadsOf(app, stats)}
                    onOpen={openApp}
                  />
                ))}
              </div>
            )}
          </section>

          <footer className="text-center text-xs text-slate-500 mt-10 px-4">
            <p className="font-bold text-slate-400">{STORE_CONFIG.STORE_NAME}</p>
            <p className="mt-1">Free Android apps &amp; games — {STORE_CONFIG.OWNER_NAME}</p>
            <p className="mt-1">
              <a
                className="underline underline-offset-2"
                href={STORE_CONFIG.OWNER_TELEGRAM}
                target="_blank"
                rel="noreferrer"
              >
                Telegram: @{STORE_CONFIG.OWNER_TELEGRAM_USERNAME}
              </a>
            </p>
          </footer>
        </main>
      )}

      <BottomDock onHome={goHome} onTop10={goTop10} onRequest={() => setRequestOpen(true)} />
      <RequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />

      {selected ? (
        <AppDetail
          app={selected}
          stats={
            stats[selected.id] ??
            stats[getAppKey(selected.id)] ??
            stats[getAppKey(selected.name)]
          }
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
