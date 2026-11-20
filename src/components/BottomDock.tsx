import { Download, Home, PlusCircle, Trophy } from 'lucide-react';
import { STORE_CONFIG } from '../config';

interface Props {
  onHome: () => void;
  onTop10: () => void;
  onRequest: () => void;
}

export function BottomDock({ onHome, onTop10, onRequest }: Props) {
  const item =
    'flex flex-col items-center gap-0.5 flex-1 py-1 text-[11px] font-bold text-slate-400 hover:text-white focus:outline-none focus-visible:text-white';
  return (
    <nav
      aria-label="Store navigation"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-24px)] max-w-md rounded-2xl bg-slate-900/90 backdrop-blur border border-white/10 shadow-2xl shadow-black/50"
    >
      <div className="flex items-center px-2 py-1.5">
        <button type="button" onClick={onHome} className={item}>
          <Home className="w-5 h-5" />
          Home
        </button>
        <button type="button" onClick={onTop10} className={item}>
          <Trophy className="w-5 h-5" />
          Top 10
        </button>
        <button type="button" onClick={onRequest} className={item}>
          <PlusCircle className="w-5 h-5" />
          Request
        </button>
        <a href={STORE_CONFIG.STORE_APP_APK_URL} className={item}>
          <Download className="w-5 h-5" />
          Store APK
        </a>
      </div>
    </nav>
  );
}
