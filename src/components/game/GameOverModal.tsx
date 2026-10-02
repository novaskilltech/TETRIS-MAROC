'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Send, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { GameStats, LeaderboardEntry } from '@/types/game';
import { Translations } from '@/lib/i18n';

interface GameOverModalProps {
  stats: GameStats;
  sessionId: string;
  sessionToken: string;
  isNewHighScore: boolean;
  onRestart: () => void;
  onViewLeaderboard: () => void;
  t: Translations;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  sessionId,
  sessionToken,
  isNewHighScore,
  onRestart,
  onViewLeaderboard,
  t,
}) => {
  const [pseudo, setPseudo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState<LeaderboardEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isNewHighScore) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#00A859', '#FF3B30', '#67E8F9'],
        });
      } catch (e) {}
    }
  }, [isNewHighScore]);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pseudo.trim().toUpperCase();
    if (clean.length < 3 || clean.length > 12) {
      setErrorMessage(t.pseudoInvalid);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          token: sessionToken,
          pseudo: clean,
          score: stats.score,
          lines: stats.lines,
          level: stats.level,
        }),
      });

      const data = await res.json();
      if (data.success && data.entry) {
        setSubmittedEntry(data.entry);
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            colors: ['#FFD700', '#00A859', '#67E8F9'],
          });
        } catch (e) {}
      } else {
        setErrorMessage(data.message || t.errorSubmitting);
      }
    } catch (err) {
      setErrorMessage(t.errorSubmitting);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-morocco-card border-2 border-morocco-gold/70 p-6 text-white shadow-[0_0_50px_rgba(212,175,55,0.25)] text-center zellij-pattern overflow-hidden">
        {/* Moroccan Khatim Sulayman 8-point gold star motif */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rotate-45 bg-morocco-gold shadow-[0_0_6px_#ffd700]"></span>
          <span className="text-[10px] font-mono font-bold text-morocco-gold uppercase tracking-widest">
            ✦ ROYAUME ARCADE ✦
          </span>
          <span className="w-1.5 h-1.5 rotate-45 bg-morocco-gold shadow-[0_0_6px_#ffd700]"></span>
        </div>

        {/* Crown / Trophy Badge */}
        <div className="mx-auto w-14 h-14 mb-3 flex items-center justify-center rounded-2xl bg-gradient-to-br from-morocco-night to-morocco-card border border-morocco-gold text-morocco-gold shadow-lg neon-gold-glow">
          <Trophy className="w-7 h-7 text-morocco-gold" />
        </div>

        <h2 className="text-xl md:text-2xl font-black tracking-wider text-morocco-red-light uppercase mb-1 font-mono">
          {t.gameOver}
        </h2>
        {isNewHighScore && (
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-morocco-gold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-morocco-gold/15 border border-morocco-gold/50 shadow-[0_0_12px_rgba(255,215,0,0.3)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.newHighScore}</span>
          </div>
        )}

        {/* Score Summary Card (Stitch Arcade Screen 2) */}
        <div className="my-4 p-3.5 rounded-2xl bg-morocco-night/95 border border-morocco-gold/40 shadow-inner">
          <div className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">{t.finalScore}</div>
          <div className="text-3xl font-black text-morocco-gold font-mono tracking-tight my-1 drop-shadow-[0_0_14px_rgba(255,215,0,0.5)]">
            {stats.score.toLocaleString()}
          </div>
          <div className="flex justify-around text-xs text-gray-400 mt-2 pt-2 border-t border-morocco-border/70 font-mono">
            <span>{t.lines}: <strong className="text-white">{stats.lines}</strong></span>
            <span>{t.level}: <strong className="text-white">{stats.level}</strong></span>
          </div>
        </div>

        {/* Pseudo Submission / Confirmation */}
        {!submittedEntry ? (
          <form onSubmit={handleSubmitScore} className="mb-4 text-left">
            <label className="block text-[10px] font-bold text-morocco-gold uppercase tracking-wider mb-1.5 font-mono">
              {t.pseudoLabel}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-morocco-gold/60 font-mono font-bold text-xs">#</span>
                <input
                  type="text"
                  maxLength={12}
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value.toUpperCase())}
                  placeholder={t.pseudoPlaceholder}
                  className="w-full pl-6 pr-3 py-2 text-sm font-mono tracking-wider font-bold rounded-xl bg-morocco-night border border-morocco-gold/40 text-white placeholder-gray-500 focus:outline-none focus:border-morocco-gold focus:ring-1 focus:ring-morocco-gold uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || pseudo.trim().length < 3}
                className="px-4 py-2 rounded-xl bg-morocco-green hover:bg-morocco-green-light disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_0_#00381c] active:translate-y-1 active:shadow-[0_1px_0_#00381c] flex items-center gap-1.5 neon-emerald-glow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? '...' : t.submitScore}</span>
              </button>
            </div>
            {errorMessage && (
              <div className="flex items-center gap-1 text-xs text-red-400 mt-2 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        ) : (
          <div className="my-4 p-3.5 rounded-2xl bg-morocco-green/20 border border-morocco-green text-left shadow-lg">
            <div className="flex items-center gap-2 text-sm font-bold text-morocco-green-light font-mono">
              <CheckCircle className="w-4 h-4" />
              <span>{t.scoreSubmitted}</span>
            </div>
            {submittedEntry.rank && (
              <div className="text-xs text-white mt-1.5 font-mono">
                {t.yourRank} : <strong className="text-morocco-gold font-black text-base drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">#{submittedEntry.rank} MONDIAL</strong>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-morocco-green to-morocco-green-dark border border-morocco-gold/50 font-black text-sm tracking-wider uppercase transition-all shadow-[0_5px_0_#002b15] active:translate-y-1 active:shadow-[0_1px_0_#002b15] flex items-center justify-center gap-2 text-white neon-emerald-glow font-mono"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.restart}</span>
          </button>

          <button
            onClick={onViewLeaderboard}
            className="w-full py-2.5 rounded-xl bg-morocco-night hover:bg-morocco-card border border-morocco-gold/40 text-morocco-gold font-bold text-xs tracking-wider uppercase transition-all active:scale-98 font-mono"
          >
            {t.leaderboard}
          </button>
        </div>
      </div>
    </div>
  );
};
