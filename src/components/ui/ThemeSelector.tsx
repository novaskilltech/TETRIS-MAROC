'use client';

import React from 'react';
import { ThemeId } from '@/types/theme';
import { Translations } from '@/lib/i18n';
import { soundManager } from '@/audio/soundManager';
import { Crown, Moon, Palmtree, Sparkles, Check } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  t: Translations;
  compact?: boolean;
}

interface ThemeMeta {
  id: ThemeId;
  label: string;
  sub: string;
  textureLabel: string;
  icon: React.ReactNode;
  bgGradient: string;
  activeBorder: string;
  accentText: string;
  pillBorder: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  t,
  compact = false,
}) => {
  const themes: ThemeMeta[] = [
    {
      id: 'maroc',
      label: t.themeMaroc,
      sub: t.themeMarocSub,
      textureLabel: t.themeBlockZellij,
      icon: <Crown className="w-5 h-5 text-morocco-gold" />,
      bgGradient: 'from-amber-950/70 via-morocco-night/95 to-emerald-950/60',
      activeBorder: 'border-morocco-gold shadow-[0_0_20px_rgba(212,175,55,0.35)]',
      accentText: 'text-morocco-gold',
      pillBorder: 'border-morocco-gold/50 text-morocco-gold-light bg-morocco-gold/10',
    },
    {
      id: 'galaxy',
      label: t.themeGalaxy,
      sub: t.themeGalaxySub,
      textureLabel: t.themeBlockGalaxy,
      icon: <Moon className="w-5 h-5 text-sky-400" />,
      bgGradient: 'from-slate-950/70 via-indigo-950/95 to-purple-950/60',
      activeBorder: 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.35)]',
      accentText: 'text-sky-300',
      pillBorder: 'border-sky-400/50 text-sky-300 bg-sky-400/10',
    },
    {
      id: 'beach',
      label: t.themeBeach,
      sub: t.themeBeachSub,
      textureLabel: t.themeBlockBeach,
      icon: <Palmtree className="w-5 h-5 text-amber-400" />,
      bgGradient: 'from-sky-950/70 via-cyan-950/95 to-amber-950/60',
      activeBorder: 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)]',
      accentText: 'text-amber-300',
      pillBorder: 'border-amber-400/50 text-amber-300 bg-amber-400/10',
    },
  ];

  const handleSelect = (id: ThemeId) => {
    if (id !== currentTheme) {
      soundManager.playButtonClick();
      onSelectTheme(id);
    }
  };

  // Compact Mode for In-Game Top Bar
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-morocco-card/90 backdrop-blur-md border border-morocco-border shadow-md">
        {themes.map((th) => {
          const isActive = currentTheme === th.id;
          return (
            <button
              key={th.id}
              onClick={() => handleSelect(th.id)}
              className={`relative px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                isActive
                  ? 'bg-white/20 border border-white/60 scale-105 shadow-sm text-white'
                  : 'opacity-60 hover:opacity-100 hover:bg-white/10 text-gray-300'
              }`}
              title={`${th.label} — ${th.textureLabel}`}
              aria-label={th.label}
            >
              <div className="scale-75">{th.icon}</div>
              <span className="text-[10px] font-bold tracking-wider hidden sm:inline uppercase">
                {th.label.split(' ')[0]}
              </span>
              {isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-morocco-gold animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Visual Card / Carousel Selector for Home Screen and Modals
  return (
    <div className="w-full flex flex-col gap-2.5 select-none text-left">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-gray-300">
          <Sparkles className="w-3.5 h-3.5 text-morocco-gold" />
          <span>{t.themeTitle}</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">
          {t.themeBlockTextureLabel} inclus
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {themes.map((th) => {
          const isActive = currentTheme === th.id;
          return (
            <button
              key={th.id}
              onClick={() => handleSelect(th.id)}
              className={`relative flex flex-col justify-between p-3 rounded-2xl border bg-gradient-to-br ${
                th.bgGradient
              } transition-all duration-200 active:scale-[0.98] text-left overflow-hidden ${
                isActive
                  ? `${th.activeBorder} border-2 scale-[1.02]`
                  : 'border-morocco-border/80 hover:border-gray-500 hover:scale-[1.01] opacity-75 hover:opacity-100'
              }`}
            >
              {/* Active Indicator Pin */}
              {isActive && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/20 border border-white/40 text-[9px] font-black uppercase text-white shadow-sm">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>Actif</span>
                </div>
              )}

              {/* Theme Header */}
              <div className="flex items-start gap-2.5 mb-2">
                <div
                  className={`p-2 rounded-xl bg-black/40 border border-white/10 shadow-inner flex items-center justify-center ${th.accentText}`}
                >
                  {th.icon}
                </div>
                <div className="flex-1 pr-6">
                  <div className={`text-xs font-black tracking-wide uppercase ${isActive ? 'text-white' : 'text-gray-200'}`}>
                    {th.label}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium leading-tight">
                    {th.sub}
                  </div>
                </div>
              </div>

              {/* Block Texture Badge */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold tracking-wide ${th.pillBorder}`}>
                <span className="text-[10px]">✦</span>
                <span className="truncate">{th.textureLabel}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
