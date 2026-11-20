import type { AppItem } from '../types';

/**
 * Real screenshots only: p1..p5, then screenshots[] / images[] / pics[].
 * The app icon is NEVER treated as a screenshot — if the icon URL appears
 * in the screenshot fields it is filtered out, and an empty result means
 * "no screenshots" (the detail view shows the big icon + a note instead).
 */
export function getScreenshots(app: AppItem): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  const add = (val: unknown) => {
    if (typeof val === 'string') {
      const s = val.trim();
      if (s.length > 5 && !seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
      return;
    }
    if (Array.isArray(val)) {
      for (const item of val) add(item);
      return;
    }
    if (val && typeof val === 'object') {
      const o = val as Record<string, unknown>;
      for (const k of ['url', 'link', 'src', 'image', 'img', 'photo', 'uri']) {
        if (typeof o[k] === 'string') {
          add(o[k]);
          return;
        }
      }
    }
  };

  // p1..p5 in order
  for (let i = 1; i <= 5; i++) add((app as Record<string, unknown>)[`p${i}`]);
  add(app.screenshots);
  add(app.images);
  add(app.pics);

  const icon = (app.icon || '').trim();
  return out.filter((s) => s !== icon);
}

export function formatSize(mb: string | number | undefined): string {
  if (mb === undefined || mb === '' || mb === null) return '';
  if (typeof mb === 'number') return `${mb} MB`;
  return String(mb);
}

export function formatCount(n: number | undefined): string {
  const v = n || 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}
