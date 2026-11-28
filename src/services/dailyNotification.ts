// Weekly notification — hafte me EK baar (Sunday 10:00 AM), rotating messages + app icon.
// User, 2026-11-28: notification hafte me ek baar aaye (roz nahi).
// Premium had NO notification before #218; #218 added a DAILY one —
// this changes it to WEEKLY. Same icons: smallIcon "ic_stat_icon" (white
// silhouette) and largeIcon "ic_notif_large" (full-colour app icon).
// Cancels any stale ids 1-7 first (incl. #218's daily ones), then schedules
// the next Sunday 10 AM. Refreshes at most once a day. Uses checkPermissions()
// only, so it never shows a second permission prompt — the launch prompt
// (App.tsx, #210 fix) already asks once.
// (Function ka naam scheduleDailyNotification hi rakha hai taaki App.tsx
// me koi change na karna pade — andar se ye weekly hai.)
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const MSGS = [
  "आज के नए ऐप देखो — फ्री डाउनलोड 📲",
  "नए ऐप आ गए हैं — अभी देखो 📲",
  "आज का बेस्ट ऐप देखो, फ्री में डाउनलोड करो 📲",
];
const FLAG = 'premium-weekly-notif-v1-ts';
const DAY = 24 * 60 * 60 * 1000;

function weekOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d.getTime() - start.getTime()) / (7 * 86400000));
}

export async function scheduleDailyNotification(): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) return;
    const last = parseInt(localStorage.getItem(FLAG) || '0', 10) || 0;
    if (Date.now() - last < DAY) return;
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') return; // launch prompt already asked; retry next launch
    // Purani scheduled notifications cancel karo (incl. #218 ki daily ids 1-7).
    const ids = Array.from({ length: 7 }, (_, k) => ({ id: k + 1 }));
    await LocalNotifications.cancel({ notifications: ids }).catch(() => {});
    // Agla Sunday 10:00 AM (aaj Sunday hai aur 10 baje nahi to aaj hi).
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    let add = (7 - d.getDay()) % 7;
    if (add === 0 && d.getTime() <= now.getTime()) add = 7;
    d.setDate(d.getDate() + add);
    await LocalNotifications.schedule({
      notifications: [{
        id: 1,
        title: 'Apna Jugaad',
        body: MSGS[weekOfYear(d) % MSGS.length],
        smallIcon: 'ic_stat_icon',
        largeIcon: 'ic_notif_large',
        iconColor: '#FFB300',
        schedule: { at: d, allowWhileIdle: true },
      }],
    });
    localStorage.setItem(FLAG, String(Date.now()));
  } catch {
    /* never break app start */
  }
}
