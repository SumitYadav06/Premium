import { AppItem } from '../types';

// GitHub Releases auto-listing:
// Owner saare apps Premium repo ke Releases par upload karta hai (ek release me kai APK).
// Ye service un releases ko padhkar store ke liye app entries bana deti hai —
// naam, version aur size asset se apne aap aata hai. Firebase me pehle se maujud
// (same link wali) entries ko App.tsx merge ke samay in par tarjeeh deta hai,
// isliye Admin Panel se edit karte hi release wali copy gayab ho jati hai.
const OWNER = 'SumitYadav06';
const REPO = 'Premium';

// Store ka apna APK jin releases/assets me hai, wo app bankar list nahi honge
const EXCLUDE_TAGS = new Set(['store-latest']);
const EXCLUDE_ASSET_EXACT = new Set(['apna.jugaad.apk', 'app-debug.apk']);

const CACHE_KEY = 'premium_store_gh_releases_v1';
const CACHE_MS = 10 * 60 * 1000; // 10 minute cache — GitHub API limit ka khayal

function isStoreAsset(fileName: string): boolean {
  const n = fileName.toLowerCase();
  if (EXCLUDE_ASSET_EXACT.has(n)) return true;
  if (n.startsWith('premium.app.store')) return true; // purana store APK asset
  return false;
}

/** "KineMaster.Pro_8.1.8.36478.GP.apk" -> { name: "KineMaster Pro", ver: "8.1.8.36478" } */
export function parseApkFileName(fileName: string): { name: string; ver: string } {
  const base = fileName.replace(/\.apk$/i, '');
  // Pehle _ aur - par todo (dots ko mat chhedo — version unhi me chhupa hota hai)
  const rawTokens = base.split(/[-_\s]+/).filter(Boolean);
  const JUNK = new Set(['sign', 'null', 'gp', 'apk']);
  let ver = '';
  const nameParts: string[] = [];

  for (const raw of rawTokens) {
    const tok = raw.replace(/^\.+|\.+$/g, '');
    if (!tok) continue;

    // Pura token hi version hai: 8.1.8, 23.0.1, 1.89
    if (!ver && /^\d+(\.\d+){1,4}[a-z]?$/i.test(tok)) {
      ver = tok;
      continue;
    }
    // Token version se shuru hota hai: "8.1.8.36478.GP" -> version + bacha hua hissa
    const m = tok.match(/^(\d+(?:\.\d+){1,4})(?:\.(.*))?$/);
    if (!ver && m) {
      ver = m[1];
      if (m[2]) {
        for (const sub of m[2].split('.')) {
          if (sub && !JUNK.has(sub.toLowerCase())) nameParts.push(sub);
        }
      }
      continue;
    }
    // Aam naam wala token — dots par todkar naam banao
    for (const sub of tok.split('.')) {
      if (sub && !JUNK.has(sub.toLowerCase())) nameParts.push(sub);
    }
  }

  return { name: nameParts.join(' ').trim() || base, ver };
}

interface GhAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
}

interface GhRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  assets: GhAsset[];
}

function cleanDesc(body: string | null, appName: string): string {
  if (!body) return `${appName} — premium mod APK, seedha GitHub release se.`;
  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*`_~|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (text || `${appName} — premium mod APK.`).slice(0, 220);
}

function firstBodyImage(body: string | null): string {
  if (!body) return '';
  const md = body.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/);
  if (md) return md[1];
  const html = body.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  return html ? html[1] : '';
}

export async function fetchReleaseApps(): Promise<AppItem[]> {
  // Cache pehle — har app khulne par GitHub API nahi marenge
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Date.now() - parsed.at < CACHE_MS && Array.isArray(parsed.apps)) {
        return parsed.apps;
      }
    }
  } catch (e) {}

  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases?per_page=50`, {
    headers: { Accept: 'application/vnd.github+json' }
  });
  if (!res.ok) throw new Error(`GitHub releases fetch failed: ${res.status}`);
  const releases: GhRelease[] = await res.json();

  const apps: AppItem[] = [];
  for (const rel of Array.isArray(releases) ? releases : []) {
    if (!rel || rel.draft) continue;
    if (EXCLUDE_TAGS.has((rel.tag_name || '').toLowerCase())) continue;

    const assets = Array.isArray(rel.assets) ? rel.assets : [];
    const imgAsset = assets.find(
      (a) => /\.(png|jpe?g|webp)$/i.test(a.name) && /icon|poster|logo|cover/i.test(a.name)
    );
    const bodyImg = firstBodyImage(rel.body);
    const icon = (imgAsset && imgAsset.browser_download_url) || bodyImg || '';

    const apkAssets = assets.filter(
      (a) => a.name.toLowerCase().endsWith('.apk') && !isStoreAsset(a.name)
    );

    for (const asset of apkAssets) {
      const parsed = parseApkFileName(asset.name);
      const single = apkAssets.length === 1;
      const name = single && rel.name && rel.name !== rel.tag_name ? rel.name : parsed.name;
      apps.push({
        id: `gh-${asset.id}`,
        name,
        cat: 'Apps',
        ver: parsed.ver || (single ? (rel.tag_name || '').replace(/^v/i, '') : ''),
        mb: parseFloat((asset.size / (1024 * 1024)).toFixed(1)),
        icon,
        link: asset.browser_download_url,
        desc: cleanDesc(rel.body, name),
        screenshots: bodyImg ? [bodyImg] : undefined,
        downloads: 0,
        rating: 4.8
      });
    }
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), apps }));
  } catch (e) {}

  return apps;
}

/** Admin form ke liye: ek GitHub release APK link se naam/size/version apne aap bharna */
export async function fetchReleaseAssetInfo(
  url: string
): Promise<{ name: string; ver: string; mb: number } | null> {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/releases\/download\/([^/]+)\/(.+)$/);
  if (!m) return null;
  const [, owner, repo, tag, assetNameRaw] = m;
  const assetName = decodeURIComponent(assetNameRaw);

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
    { headers: { Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) return null;
  const rel: GhRelease = await res.json();
  const asset = (rel.assets || []).find((a) => a.name === assetName);
  if (!asset) return null;

  const parsed = parseApkFileName(asset.name);
  return {
    name: parsed.name,
    ver: parsed.ver || (rel.tag_name || '').replace(/^v/i, ''),
    mb: parseFloat((asset.size / (1024 * 1024)).toFixed(1))
  };
}
