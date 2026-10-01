'use client';

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Globe } from 'lucide-react';
import { Translations, Language } from '@/lib/i18n';
import { ThemeId } from '@/types/theme';
import { ThemeSelector } from '@/components/ui/ThemeSelector';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  lang: Language;
  onToggleLang: () => void;
  themeId: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  t: Translations;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onQuit,
  isMuted,
  onToggleMute,
  lang,
  onToggleLang,
  themeId,
  onSelectTheme,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xs rounded-2xl bg-morocco-card border-2 border-morocco-gold/60 p-6 text-white shadow-2xl text-center">
        <h2 className="text-2xl font-black tracking-widest text-morocco-gold uppercase mb-5">
          {t.pause}
        </h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-morocco-green hover:bg-morocco-green-light font-bold text-sm tracking-wider uppercase transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 text-white"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.resume}</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-morocco-night hover:bg-morocco-border border border-morocco-border text-gray-200 font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.restart}</span>
          </button>

          <button
            onClick={onQuit}
            className="w-full py-2.5 rounded-xl bg-morocco-night hover:bg-morocco-border border border-morocco-border text-gray-400 hover:text-white font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>{t.quit}</span>
          </button>

          {/* Theme Switcher inside Pause */}
          <div className="mt-2 pt-3 border-t border-morocco-border">
            <ThemeSelector currentTheme={themeId} onSelectTheme={onSelectTheme} t={t} />
          </div>

          {/* Sound & Language */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-morocco-border">
            <button
              onClick={onToggleMute}
              className="py-2 px-3 rounded-lg bg-morocco-night border border-morocco-border text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-morocco-gold/40 text-gray-300"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-morocco-red" /> : <Volume2 className="w-3.5 h-3.5 text-morocco-green" />}
              <span>{isMuted ? 'Mute' : 'Son'}</span>
            </button>

            <button
              onClick={onToggleLang}
              className="py-2 px-3 rounded-lg bg-morocco-night border border-morocco-border text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-morocco-gold/40 text-gray-300"
            >
              <Globe className="w-3.5 h-3.5 text-morocco-gold" />
              <span>{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
