'use client';

import React from 'react';
import { TetrominoType, GameStats } from '@/types/game';
import { ThemeId } from '@/types/theme';
import { TETROMINOES } from '@/core/tetrominoes';
import { Volume2, VolumeX, Pause, Play, Trophy, Sparkles } from 'lucide-react';
import { Translations } from '@/lib/i18n';
import { ThemeSelector } from '@/components/ui/ThemeSelector';

interface StatsPanelProps {
  stats: GameStats;
  nextPiece: TetrominoType;
  highScore: number;
  isPaused: boolean;
  isMuted: boolean;
  themeId: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  onTogglePause: () => void;
  onToggleMute: () => void;
  t: Translations;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  stats,
  nextPiece,
  highScore,
  isPaused,
  isMuted,
  themeId,
  onSelectTheme,
  onTogglePause,
  onToggleMute,
  t,
}) => {
  const nextDef = TETROMINOES[nextPiece];
  const nextShape = nextDef ? nextDef.shapes[0] : [];
  const levelProgress = ((stats.lines % 10) / 10) * 100;

  return (
    <div className="w-full flex flex-col gap-2.5 text-white select-none">
      {/* Top quick controls with arcade neon borders */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-morocco-card/90 backdrop-blur-md border border-morocco-gold/30 shadow-md">
        <button
          onClick={onTogglePause}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-morocco-night border border-morocco-gold/40 text-morocco-gold hover:bg-morocco-gold/15 text-xs font-mono font-bold tracking-wider uppercase transition-all active:scale-95"
          title={isPaused ? t.resume : t.pause}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-morocco-green-light" /> : <Pause className="w-3.5 h-3.5 text-morocco-gold" />}
          <span>{isPaused ? t.resume : t.pause}</span>
        </button>

        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg bg-morocco-night border border-morocco-border text-gray-300 hover:text-white hover:border-morocco-gold/40 transition-all active:scale-95"
          title={isMuted ? t.soundOff : t.soundOn}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-morocco-red-light" /> : <Volume2 className="w-4 h-4 text-morocco-green-light" />}
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
        {/* Live Score Display (Stitch Digital LED Style) */}
        <div className="relative p-3 rounded-xl bg-morocco-night/90 backdrop-blur-md border border-morocco-gold/40 flex flex-col justify-center overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-morocco-gold font-bold uppercase tracking-wider">{t.score}</span>
            <span className="w-1.5 h-1.5 rotate-45 bg-morocco-gold shadow-[0_0_6px_#ffd700]"></span>
          </div>
          <div className="text-xl md:text-2xl font-black text-morocco-gold font-mono tracking-tight drop-shadow-[0_0_12px_rgba(255,225,109,0.5)] mt-0.5">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* High Score Badge */}
        <div className="p-2.5 rounded-xl bg-morocco-card/85 backdrop-blur-md border border-morocco-border flex flex-col justify-center">
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            <Trophy className="w-3 h-3 text-morocco-gold" />
            <span>{t.highScore}</span>
          </div>
          <div className="text-base md:text-lg font-bold text-white font-mono tracking-tight mt-0.5">
            {highScore.toLocaleString()}
          </div>
        </div>

        {/* Lines & Level with Progress Bar */}
        <div className="p-2.5 rounded-xl bg-morocco-card/85 backdrop-blur-md border border-morocco-border flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.level}</div>
              <div className="text-base font-black text-morocco-green-light font-mono">{stats.level}</div>
            </div>
            <div className="border-l border-morocco-border">
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.lines}</div>
              <div className="text-base font-black text-morocco-red-light font-mono">{stats.lines}</div>
            </div>
          </div>
          {/* Level Progress Bar */}
          <div className="w-full bg-morocco-night h-1.5 rounded-full overflow-hidden border border-morocco-border/50">
            <div
              className="bg-gradient-to-r from-morocco-green to-morocco-gold h-full rounded-full transition-all duration-300"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Next Piece Preview Shrine (Stitch Miniature Reservoir) */}
        <div className="relative p-3 rounded-xl bg-morocco-card/90 backdrop-blur-md border border-morocco-gold/30 flex flex-col items-center justify-center shadow-lg overflow-hidden">
          {/* Top arch accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-morocco-gold/40 rounded-b"></div>
          <div className="text-[10px] text-morocco-gold font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-morocco-gold" />
            <span>{t.nextPiece}</span>
          </div>
          <div className="w-16 h-16 flex items-center justify-center bg-morocco-night/95 rounded-lg border border-morocco-gold/30 p-2 shadow-inner">
            {nextDef && (
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${nextShape[0]?.length || 4}, minmax(0, 1fr))`,
                }}
              >
                {nextShape.map((row, rIdx) =>
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`w-3.5 h-3.5 rounded-[3px] transition-all ${
                        cell !== 0 ? 'shadow-sm' : 'bg-transparent'
                      }`}
                      style={{
                        backgroundColor: cell !== 0 ? nextDef.color : 'transparent',
                        boxShadow: cell !== 0 ? `0 0 10px ${nextDef.color}99` : 'none',
                        border: cell !== 0 ? `1px solid ${nextDef.highlightColor}` : 'none',
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Theme Switcher on lateral panel */}
        <div className="p-2 rounded-xl bg-morocco-card/85 backdrop-blur-md border border-morocco-border">
          <ThemeSelector currentTheme={themeId} onSelectTheme={onSelectTheme} t={t} compact />
        </div>
      </div>
    </div>
  );
};
