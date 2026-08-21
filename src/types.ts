export interface AppItem {
  id: string;
  name: string;
  cat: string;
  ver: string;
  mb: string | number;
  icon: string;
  link: string;
  desc: string;
  p1?: string;
  p2?: string;
  p3?: string;
  p4?: string;
  p5?: string;
  packageName?: string;
  minAndroid?: string;
  developer?: string;
  downloads?: number;
  rating?: number;
  changelog?: string;
  architecture?: string;
  isHot?: boolean;
  isFeatured?: boolean;
}

export interface ReviewItem {
  id?: string;
  user: string;
  text: string;
  rating: number;
  time: string;
  verified?: boolean;
}

export interface AppStats {
  views: number;
  downloads?: number;
  comments?: Record<string, ReviewItem> | ReviewItem[];
}

export interface StoreStatus {
  active: boolean;
  msg: string;
  link: string;
}

export interface DownloadTask {
  appId: string;
  appName: string;
  appIcon: string;
  version: string;
  sizeMb: string | number;
  progress: number;
  status: 'pending' | 'downloading' | 'verifying' | 'ready' | 'installed' | 'failed';
  downloadUrl: string;
  speed?: string;
  downloadedBytes?: number;
  totalBytes?: number;
  startedAt: number;
  completedAt?: number;
}
