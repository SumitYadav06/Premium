import React from 'react';
import { Sparkles, Gamepad2, Wrench, Share2, Video, Music } from 'lucide-react';

interface CategoryPillsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  appsCountByCategory: Record<string, number>;
  theme: 'dark' | 'light';
}

const CAT_ICONS: Record<string, React.ReactNode> = {
  All: <Sparkles className="w-3.5 h-3.5" />,
  Tools: <Wrench className="w-3.5 h-3.5" />,
  Games: <Gamepad2 className="w-3.5 h-3.5" />,
  Social: <Share2 className="w-3.5 h-3.5" />,
  Video: <Video className="w-3.5 h-3.5" />,
  Music: <Music className="w-3.5 h-3.5" />
};

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  appsCountByCategory,
  theme
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none select-none">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = appsCountByCategory[cat] ?? 0;

        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 active:scale-95 ${
              isSelected
                ? 'btn-live bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white shadow-lg shadow-fuchsia-500/40 ring-2 ring-fuchsia-400/60'
                : theme === 'dark'
                ? 'bg-white border border-slate-200 text-slate-500 hover:text-fuchsia-600 hover:border-fuchsia-300 shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
          >
            <span className={isSelected ? 'text-white' : 'text-fuchsia-500'}>
              {CAT_ICONS[cat] || <Sparkles className="w-3.5 h-3.5" />}
            </span>
            <span>{cat}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : theme === 'dark'
                  ? 'bg-slate-800 text-slate-500'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
