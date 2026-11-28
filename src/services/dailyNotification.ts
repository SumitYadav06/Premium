// Daily notification — rotating messages + app icon (Apna Jugaad / Premium).
// Premium had NO daily notification: the only notification was the system
// DownloadManager download-% one, whose icon Android controls. This adds ONE
// notification a day at 10:00 AM, rotating through 3 messages, with the app's
// own icons: smallIcon "ic_stat_icon" (white silhouette in res/drawable-*)
// and largeIcon "ic_notif_large" (full-colour app icon in res/drawable-*).
// Same 7-day-window design as the games: cancels old ids, schedules the next
// 7 days, refreshes at most once a day. Uses checkPermissions() only, so it
// never shows a second permission prompt — the launch prompt (App.tsx, #210
// fix) already asks once.
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const MSGS = [
  "आज के नए ऐप देखो — फ्री डाउनलोड 📲",
  "नए ऐप आ गए हैं — अभी देखो 📲",
  "आज का बेस्ट ऐप देखो, फ्री में डाउनलोड करो 📲",
];
const FLAG = 'premium-daily-notif-v2-ts';
const DAY = 24 * 60 * 60 * 1000;

function dayOfYear(d: Date): number {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
}

export async function scheduleDailyNotification(): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) return;
    const last = parseInt(localStorage.getItem(FLAG) || '0', 10) || 0;
    if (Date.now() - last < DAY) return;
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') return; // launch prompt already asked; retry next launch
    const ids = Array.from({ length: 7 }, (_, k) => ({ id: k + 1 }));
    const now = new Date();
    const list: Array<{
      id: number; title: string; body: string;
      smallIcon: string; largeIcon: string; iconColor: string;
      schedule: { at: Date; allowWhileIdle: boolean };
    }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 10, 0, 0);
      if (d.getTime() <= now.getTime()) continue;
      list.push({
        id: list.length + 1,
        title: 'Apna Jugaad',
        body: MSGS[dayOfYear(d) % MSGS.length],
        smallIcon: 'ic_stat_icon',
        largeIcon: 'ic_notif_large',
        iconColor: '#FFB300',
        schedule: { at: d, allowWhileIdle: true },
      });
    }
    await LocalNotifications.cancel({ notifications: ids }).catch(() => {});
    if (!list.length) return;
    await LocalNotifications.schedule({ notifications: list });
    localStorage.setItem(FLAG, String(Date.now()));
  } catch {
    /* never break app start */
  }
}
