'use client';

import React from 'react';
import { ThemeId } from '@/types/theme';
import { Translations } from '@/lib/i18n';
import { soundManager } from '@/audio/soundManager';
import { Crown, Moon, Palmtree } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  t: Translations;
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  t,
  compact = false,
}) => {
  const themes: { id: ThemeId; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'maroc',
      label: t.themeMaroc,
      icon: <Crown className="w-4 h-4 text-morocco-gold" />,
      color: 'border-morocco-gold text-morocco-gold bg-morocco-night',
    },
    {
      id: 'galaxy',
      label: t.themeGalaxy,
      icon: <Moon className="w-4 h-4 text-sky-400" />,
      color: 'border-sky-400 text-sky-300 bg-slate-900',
    },
    {
      id: 'beach',
      label: t.themeBeach,
      icon: <Palmtree className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-400 text-amber-300 bg-sky-950',
    },
  ];

  const handleSelect = (id: ThemeId) => {
    soundManager.playButtonClick();
    onSelectTheme(id);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-xl bg-morocco-card/90 backdrop-blur-md border border-morocco-border shadow-md">
        {themes.map((th) => {
          const isActive = currentTheme === th.id;
          return (
            <button
              key={th.id}
              onClick={() => handleSelect(th.id)}
              className={`p-1.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-white/20 border border-white/60 scale-105 shadow-sm'
                  : 'opacity-60 hover:opacity-100 hover:bg-white/10'
              }`}
              title={th.label}
              aria-label={th.label}
            >
              {th.icon}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      <div className="text-[11px] font-bold tracking-widest uppercase text-gray-400 text-left">
        {t.themeTitle}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {themes.map((th) => {
          const isActive = currentTheme === th.id;
          return (
            <button
              key={th.id}
              onClick={() => handleSelect(th.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all active:scale-95 ${
                isActive
                  ? `${th.color} border-2 shadow-lg scale-[1.02]`
                  : 'bg-morocco-card border-morocco-border text-gray-400 hover:text-white hover:border-gray-500'
              }`}
            >
              <div className="mb-1.5">{th.icon}</div>
              <span className="text-[10px] leading-tight text-center">{th.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
