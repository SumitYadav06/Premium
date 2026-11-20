import React from 'react';
import { Sparkles, Gamepad2, Wrench, Share2, Video, Music, Clapperboard, Image, Popcorn, Dumbbell, GraduationCap, Wallet, ShoppingBag, UtensilsCrossed, Plane, MessageCircle, ListChecks, Palette, Heart, Trophy, Newspaper, Briefcase, HeartHandshake, BookOpen, CloudSun, Navigation, ShieldCheck, Lock, LayoutGrid, Keyboard, Paintbrush, Globe, Camera, Bot } from 'lucide-react';

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
  Music: <Music className="w-3.5 h-3.5" />,
  'Video Editing': <Clapperboard className="w-3.5 h-3.5" />,
  'Photo Editing': <Image className="w-3.5 h-3.5" />,
  Entertainment: <Popcorn className="w-3.5 h-3.5" />,
  'Health & Fitness': <Dumbbell className="w-3.5 h-3.5" />,
  Education: <GraduationCap className="w-3.5 h-3.5" />,
  Finance: <Wallet className="w-3.5 h-3.5" />,
  Shopping: <ShoppingBag className="w-3.5 h-3.5" />,
  'Food & Drink': <UtensilsCrossed className="w-3.5 h-3.5" />,
  Travel: <Plane className="w-3.5 h-3.5" />,
  Communication: <MessageCircle className="w-3.5 h-3.5" />,
  Productivity: <ListChecks className="w-3.5 h-3.5" />,
  Personalization: <Palette className="w-3.5 h-3.5" />,
  Lifestyle: <Heart className="w-3.5 h-3.5" />,
  Sports: <Trophy className="w-3.5 h-3.5" />,
  News: <Newspaper className="w-3.5 h-3.5" />,
  Business: <Briefcase className="w-3.5 h-3.5" />,
  Dating: <HeartHandshake className="w-3.5 h-3.5" />,
  Books: <BookOpen className="w-3.5 h-3.5" />,
  Weather: <CloudSun className="w-3.5 h-3.5" />,
  'Maps & Navigation': <Navigation className="w-3.5 h-3.5" />,
  Security: <ShieldCheck className="w-3.5 h-3.5" />,
  VPN: <Lock className="w-3.5 h-3.5" />,
  Launcher: <LayoutGrid className="w-3.5 h-3.5" />,
  Keyboard: <Keyboard className="w-3.5 h-3.5" />,
  Wallpaper: <Paintbrush className="w-3.5 h-3.5" />,
  Browser: <Globe className="w-3.5 h-3.5" />,
  Camera: <Camera className="w-3.5 h-3.5" />,
  'AI Tools': <Bot className="w-3.5 h-3.5" />
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
            onClick={(e) => {
              onSelectCategory(cat);
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-bold uppercase tracking-wide transition-all flex-shrink-0 active:scale-95 max-w-[168px] ${
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
            <span className="truncate">{cat}</span>
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
