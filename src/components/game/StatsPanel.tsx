'use client';

import React from 'react';
import { TetrominoType, GameStats } from '@/types/game';
import { TETROMINOES } from '@/core/tetrominoes';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { Translations } from '@/lib/i18n';

interface StatsPanelProps {
  stats: GameStats;
  nextPiece: TetrominoType;
  highScore: number;
  isPaused: boolean;
  isMuted: boolean;
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
  onTogglePause,
  onToggleMute,
  t,
}) => {
  const nextDef = TETROMINOES[nextPiece];
  const nextShape = nextDef ? nextDef.shapes[0] : [];

  return (
    <div className="w-full flex flex-col gap-3 text-white select-none">
      {/* Top quick controls */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-morocco-card border border-morocco-border shadow-md">
        <button
          onClick={onTogglePause}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-morocco-night border border-morocco-gold/40 text-morocco-gold hover:bg-morocco-gold/10 text-xs font-bold tracking-wider uppercase transition-colors"
          title={isPaused ? t.resume : t.pause}
        >
          {isPaused ? <Play className="w-4 h-4 text-morocco-green" /> : <Pause className="w-4 h-4 text-morocco-gold" />}
          <span>{isPaused ? t.resume : t.pause}</span>
        </button>

        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg bg-morocco-night border border-morocco-border text-gray-300 hover:text-white hover:border-morocco-gold/40 transition-colors"
          title={isMuted ? t.soundOff : t.soundOn}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-morocco-red" /> : <Volume2 className="w-4 h-4 text-morocco-green" />}
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
        {/* Score */}
        <div className="p-3 rounded-xl bg-morocco-card border border-morocco-border flex flex-col justify-center">
          <div className="text-[10px] text-morocco-gold font-semibold uppercase tracking-wider">{t.score}</div>
          <div className="text-xl md:text-2xl font-black text-white font-mono tracking-tight">{stats.score.toLocaleString()}</div>
        </div>

        {/* High Score */}
        <div className="p-3 rounded-xl bg-morocco-card border border-morocco-border flex flex-col justify-center">
          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{t.highScore}</div>
          <div className="text-lg md:text-xl font-bold text-morocco-gold font-mono tracking-tight">{highScore.toLocaleString()}</div>
        </div>

        {/* Lines & Level */}
        <div className="p-3 rounded-xl bg-morocco-card border border-morocco-border grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{t.level}</div>
            <div className="text-lg font-bold text-morocco-green font-mono">{stats.level}</div>
          </div>
          <div className="border-l border-morocco-border">
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{t.lines}</div>
            <div className="text-lg font-bold text-morocco-red font-mono">{stats.lines}</div>
          </div>
        </div>

        {/* Next Piece Preview */}
        <div className="p-3 rounded-xl bg-morocco-card border border-morocco-border flex flex-col items-center justify-center">
          <div className="text-[10px] text-morocco-gold font-semibold uppercase tracking-wider mb-2">{t.nextPiece}</div>
          <div className="w-16 h-16 flex items-center justify-center bg-morocco-night/80 rounded-lg border border-morocco-border/50 p-2">
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
                      className={`w-3 h-3 rounded-[2px] ${
                        cell !== 0
                          ? 'border border-black/30 shadow-sm'
                          : 'bg-transparent'
                      }`}
                      style={{
                        backgroundColor: cell !== 0 ? nextDef.color : 'transparent',
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
