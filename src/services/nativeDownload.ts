import { Capacitor } from '@capacitor/core';

/** True jab site store APK (Capacitor app) ke andar chal rahi ho */
export const isNativeApp = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

/** True jab installed store APK me Filesystem plugin maujud ho (naya APK) */
export const isFilesystemAvailable = (): boolean => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Filesystem');
  } catch {
    return false;
  }
};

export type DownloadMode = 'native' | 'old-apk' | 'browser';

/** native = in-app download chalega | old-apk = purana store APK, plugin nahi | browser = website mode */
export const getDownloadMode = (): DownloadMode => {
  try {
    if (!Capacitor.isNativePlatform()) return 'browser';
    return Capacitor.isPluginAvailable('Filesystem') ? 'native' : 'old-apk';
  } catch {
    return 'browser';
  }
};

export interface NativeProgress {
  pct: number;
  downloadedMb: number;
  speedMbps: number;
  etaSeconds: number;
}

/**
 * APK ko app ke andar hi download karta hai — Chrome/browser nahi khulta.
 * Progress real-time callback se milta hai. Pura hone par file path return hota hai.
 */
export async function downloadApkInApp(
  url: string,
  fileName: string,
  onProgress: (p: NativeProgress) => void
): Promise<string> {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');

  let lastBytes = 0;
  let lastTime = Date.now();
  let speed = 0;

  const listener = await Filesystem.addListener('progress', (status) => {
    if (status.url !== url) return;
    const total = status.contentLength || 0;
    const now = Date.now();
    const dt = (now - lastTime) / 1000;
    if (dt >= 0.4 && status.bytes >= lastBytes) {
      const inst = (status.bytes - lastBytes) / dt / (1024 * 1024);
      speed = speed === 0 ? inst : speed * 0.6 + inst * 0.4;
      lastBytes = status.bytes;
      lastTime = now;
    }
    const pct = total > 0 ? Math.min(99, Math.floor((status.bytes / total) * 100)) : 0;
    const remainingMb = total > 0 ? (total - status.bytes) / (1024 * 1024) : 0;
    onProgress({
      pct,
      downloadedMb: status.bytes / (1024 * 1024),
      speedMbps: speed,
      etaSeconds: speed > 0.1 ? Math.ceil(remainingMb / speed) : 0,
    });
  });

  try {
    const result = await Filesystem.downloadFile({
      url,
      path: fileName,
      directory: Directory.Cache,
      recursive: true,
      progress: true,
    });
    if (!result.path) throw new Error('Download path missing');
    return result.path;
  } finally {
    await listener.remove();
  }
}

/** Download ki hui APK ka Android system installer kholta hai */
export async function openApkInstaller(path: string): Promise<void> {
  const { FileOpener } = await import('@capawesome-team/capacitor-file-opener');
  await FileOpener.openFile({
    path,
    mimeType: 'application/vnd.android.package-archive',
  });
}
