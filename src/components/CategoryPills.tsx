import {
  Clapperboard,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Image,
  Music,
  Popcorn,
  Share2,
  Video,
  Wrench,
} from 'lucide-react';
import type { ReactNode } from 'react';

/** The ONLY categories in the store — exact spelling, no extras, no "All". */
export const CATEGORIES: string[] = [
  'Video Editing',
  'Photo Editing',
  'Video',
  'Music',
  'Social',
  'Games',
  'Tools',
  'Entertainment',
  'Health & Fitness',
  'Education',
];

const CAT_ICONS: Record<string, ReactNode> = {
  'Video Editing': <Clapperboard className="w-3.5 h-3.5" />,
  'Photo Editing': <Image className="w-3.5 h-3.5" />,
  Video: <Video className="w-3.5 h-3.5" />,
  Music: <Music className="w-3.5 h-3.5" />,
  Social: <Share2 className="w-3.5 h-3.5" />,
  Games: <Gamepad2 className="w-3.5 h-3.5" />,
  Tools: <Wrench className="w-3.5 h-3.5" />,
  Entertainment: <Popcorn className="w-3.5 h-3.5" />,
  'Health & Fitness': <Dumbbell className="w-3.5 h-3.5" />,
  Education: <GraduationCap className="w-3.5 h-3.5" />,
};

interface Props {
  selected: string | null;
  counts: Record<string, number>;
  onSelect: (cat: string | null) => void;
}

export function CategoryPills({ selected, counts, onSelect }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="listbox" aria-label="Categories">
      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat;
        const count = counts[cat] ?? 0;
        return (
          <button
            key={cat}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(isSelected ? null : cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
              isSelected
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30'
                : 'bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/40'
            }`}
          >
            <span className={isSelected ? 'text-white' : 'text-fuchsia-400'}>{CAT_ICONS[cat]}</span>
            {cat}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
