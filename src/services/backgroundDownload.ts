import { Capacitor, registerPlugin } from '@capacitor/core';

/**
 * Background download — Android ke system DownloadManager ka bridge.
 *
 * Filesystem.downloadFile app ke andar chalta hai: app band / Home dabate hi
 * download ruk jata hai aur notification me kuch nahi dikhta. DownloadManager
 * system service me chalta hai — app band ho to bhi download pura hota hai aur
 * notification shade me live % dikhta hai (Play Store jaisa).
 *
 * Native side: native/BackgroundDownloadPlugin.java — MainActivity me
 * registerPlugin() se judta hai. Purane APK me ye plugin nahi hai, isliye
 * isBackgroundDownloadAvailable() false hota hai aur modal purane
 * Filesystem wale raste par chala jata hai (fallback, kuch nahi toot ta).
 */

export interface BackgroundDownloadPlugin {
  download(options: {
    url: string;
    fileName: string;
    title: string;
    description?: string;
  }): Promise<{ downloadId: number }>;
  getStatus(options: { downloadId: number }): Promise<{
    status: string;
    downloadedBytes: number;
    totalBytes: number;
    reason: number;
    localUri?: string;
  }>;
  findByFileName(options: { fileName: string }): Promise<{
    found: boolean;
    downloadId?: number;
    status?: string;
    downloadedBytes?: number;
    totalBytes?: number;
  }>;
  openFile(options: { downloadId: number }): Promise<void>;
  cancel(options: { downloadId: number }): Promise<void>;
}

const BackgroundDownload = registerPlugin<BackgroundDownloadPlugin>('BackgroundDownload');

/** True jab naya store APK ho (plugin maujud) — purane APK / website par false */
export const isBackgroundDownloadAvailable = (): boolean => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('BackgroundDownload');
  } catch {
    return false;
  }
};

export type BgDownloadStatus = 'pending' | 'running' | 'paused' | 'successful' | 'failed' | 'unknown';

export interface BgDownloadState {
  status: BgDownloadStatus;
  downloadedBytes: number;
  totalBytes: number;
  reason: number;
}

const toStatus = (s: string): BgDownloadStatus =>
  s === 'pending' || s === 'running' || s === 'paused' || s === 'successful' || s === 'failed'
    ? s
    : 'unknown';

/** DownloadManager me download shuru karo — downloadId milta hai, download background me chalta hai */
export async function startBackgroundDownload(
  url: string,
  fileName: string,
  title: string
): Promise<number> {
  const res = await BackgroundDownload.download({
    url,
    fileName,
    title,
    description: 'Apna Jugaad se download ho raha hai',
  });
  return res.downloadId;
}

export async function getBackgroundDownloadStatus(downloadId: number): Promise<BgDownloadState> {
  const res = await BackgroundDownload.getStatus({ downloadId });
  return {
    status: toStatus(res.status),
    downloadedBytes: res.downloadedBytes || 0,
    totalBytes: res.totalBytes ?? -1,
    reason: res.reason || 0,
  };
}

/** File naam se DownloadManager me dhoondo — dobara download rokne aur wapas judne ke liye */
export async function findBackgroundDownload(fileName: string): Promise<{
  found: boolean;
  downloadId?: number;
  status?: BgDownloadStatus;
  downloadedBytes?: number;
  totalBytes?: number;
}> {
  const res = await BackgroundDownload.findByFileName({ fileName });
  if (!res.found || res.downloadId == null) return { found: false };
  return {
    found: true,
    downloadId: res.downloadId,
    status: res.status ? toStatus(res.status) : 'unknown',
    downloadedBytes: res.downloadedBytes || 0,
    totalBytes: res.totalBytes ?? -1,
  };
}

/** Pura download hua APK ka system installer kholo */
export async function openBackgroundDownload(downloadId: number): Promise<void> {
  await BackgroundDownload.openFile({ downloadId });
}

/** Chal raha / fail hua download hatao (retry se pehle) */
export async function cancelBackgroundDownload(downloadId: number): Promise<void> {
  try {
    await BackgroundDownload.cancel({ downloadId });
  } catch {
    /* entry pehle se gayab ho to koi baat nahi */
  }
}

export interface BgProgressUpdate {
  status: BgDownloadStatus;
  pct: number;
  downloadedMb: number;
  speedMbps: number;
  etaSeconds: number;
  reason: number;
}

/**
 * DownloadManager ko poll karke live progress do — DownloadManager khud
 * progress event nahi bhejta, isliye app khula ho tab polling se drawer /
 * modal me % update hota hai. App band ho to system notification % dikhati hai.
 * Wapas aane par stop() call karo (modal band / unmount).
 */
export function pollBackgroundDownload(
  downloadId: number,
  onUpdate: (u: BgProgressUpdate) => void,
  intervalMs = 700
): () => void {
  let stopped = false;
  let lastBytes = 0;
  let lastTime = Date.now();
  let speed = 0;

  const tick = async () => {
    if (stopped) return;
    try {
      const s = await getBackgroundDownloadStatus(downloadId);
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      if (dt >= 0.4 && s.downloadedBytes >= lastBytes) {
        const inst = (s.downloadedBytes - lastBytes) / dt / (1024 * 1024);
        speed = speed === 0 ? inst : speed * 0.6 + inst * 0.4;
        lastBytes = s.downloadedBytes;
        lastTime = now;
      }
      const pct =
        s.totalBytes > 0 ? Math.min(99, Math.floor((s.downloadedBytes / s.totalBytes) * 100)) : 0;
      const remainingMb =
        s.totalBytes > 0 ? Math.max(0, (s.totalBytes - s.downloadedBytes) / (1024 * 1024)) : 0;
      onUpdate({
        status: s.status,
        pct: s.status === 'successful' ? 100 : pct,
        downloadedMb: s.downloadedBytes / (1024 * 1024),
        speedMbps: speed,
        etaSeconds: speed > 0.1 ? Math.ceil(remainingMb / speed) : 0,
        reason: s.reason,
      });
      if (s.status === 'successful' || s.status === 'failed') return; // terminal — polling khatam
    } catch {
      /* ek poll fail ho to agle tick par phir try karo — download nahi rukta */
    }
    if (!stopped) timer = window.setTimeout(tick, intervalMs);
  };

  let timer = window.setTimeout(tick, 100);
  return () => {
    stopped = true;
    window.clearTimeout(timer);
  };
}

/** DownloadManager ke fail reason code ko padhne layak wajah me badlo */
export function bgFailureReason(reason: number): string {
  switch (reason) {
    case 1006:
      return 'Phone me jagah (storage) kam hai — thodi jagah khaali karke dobara try karo.';
    case 1004:
    case 1002:
      return 'Download beech me ruk gaya (internet/server) — dobara try karo.';
    case 1001:
      return 'File save nahi ho payi — Downloads folder check karo aur dobara try karo.';
    case 1005:
      return 'Download link kaam nahi kar raha — creator ko bata do.';
    case 1008:
      return 'Download dobara shuru nahi ho paya — phir se try karo.';
    default:
      return `Download fail ho gaya (code ${reason}) — dobara try karo.`;
  }
}
