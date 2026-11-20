/** App ka naam normalise karo — "Gaana Pro", "Gaana.pro", "Gaana Premium"
 *  sab "gaana" ban jate hain — taaki Firebase app aur GitHub release
 *  copy ko ek hi app pehchana ja sake. */
export function normalizeAppName(name: string | null | undefined): string {
  return (name || '')
    .toLowerCase()
    .replace(/\b(pro|premium|mod|apk|unlocked|without vpn|vip|plus|lite|duo|202\d|v\d+(\.\d+)*)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

/** Naam ka pehla akshar — icon na mile to dikhane ke liye rang-biranga tile. */
export function letterIconDataUri(name: string | null | undefined): string {
  const ch = ((name || '?').trim().charAt(0) || '?').toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112">` +
    `<rect width="112" height="112" rx="28" fill="#7c3aed"/>` +
    `<text x="56" y="76" font-size="58" font-family="Arial,sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">${ch}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
