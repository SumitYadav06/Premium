// Share an app: native share sheet first, clipboard copy as fallback.
// Used by the app card (App.tsx) — the detail view has its own copy of
// the same flow (AppDetailView.tsx) and was left untouched on purpose.
import { AppItem } from '../types';
import { STORE_CONFIG } from '../config';

export function buildShareText(app: AppItem): string {
  const storeLink = STORE_CONFIG.STORE_BASE_URL || window.location.href.split('#')[0];
  // Link na ho to KHALI rakho — kisi aur app ki sample file ka link kabhi mat bhejo.
  const apkLink = app.link || (app as any).url || '';
  return `🔥 *${app.name}* (v${app.ver}) - VIP MOD APK\n` +
    `⚡ Size: ${app.mb} MB | Category: ${app.cat}\n` +
    `🛡️ Status: 100% Virus-Free & Verified ✅\n\n` +
    (apkLink ? `📥 *Direct APK Download:*\n${apkLink}\n\n` : '') +
    `🌐 *Store Link:*\n${storeLink}\n\n` +
    `👑 Shared from *${STORE_CONFIG.OWNER_NAME}'s Premium Store*`;
}

/**
 * Returns 'shared' (native sheet opened), 'copied' (text copied to
 * clipboard) or 'failed' (neither worked). Never throws.
 */
export async function shareApp(app: AppItem): Promise<'shared' | 'copied' | 'failed'> {
  const text = buildShareText(app);
  const url = STORE_CONFIG.STORE_BASE_URL || window.location.href.split('#')[0];
  try {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav && typeof (nav as any).share === 'function') {
      try {
        await (nav as any).share({
          title: `${app.name} - VIP MOD APK`,
          text,
          url,
        });
        return 'shared';
      } catch {
        // User dismissed the sheet — fall through to clipboard copy.
      }
    }
    if (nav && (nav as any).clipboard && typeof (nav as any).clipboard.writeText === 'function') {
      await (nav as any).clipboard.writeText(text);
      return 'copied';
    }
    return 'failed';
  } catch {
    return 'failed';
  }
}
