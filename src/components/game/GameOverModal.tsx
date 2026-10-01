'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Send, CheckCircle, AlertCircle } from 'lucide-react';
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
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C1272D', '#006233', '#D4AF37'],
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
            particleCount: 50,
            spread: 60,
            colors: ['#D4AF37', '#006233', '#C1272D'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-morocco-card border-2 border-morocco-gold/60 p-6 text-white shadow-2xl text-center">
        {/* Moroccan Star Badge */}
        <div className="mx-auto w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-morocco-night border border-morocco-gold text-morocco-gold">
          <Trophy className="w-6 h-6 text-morocco-gold animate-bounce" />
        </div>

        <h2 className="text-2xl font-black tracking-wider text-morocco-red-light uppercase mb-1">
          {t.gameOver}
        </h2>
        {isNewHighScore && (
          <div className="text-xs font-bold text-morocco-gold uppercase tracking-widest mb-3 animate-pulse">
            ★ {t.newHighScore} ★
          </div>
        )}

        {/* Score Summary */}
        <div className="my-4 p-3 rounded-xl bg-morocco-night border border-morocco-border">
          <div className="text-xs text-gray-400 uppercase tracking-wider">{t.finalScore}</div>
          <div className="text-3xl font-black text-morocco-gold font-mono tracking-tight my-1">
            {stats.score.toLocaleString()}
          </div>
          <div className="flex justify-around text-xs text-gray-400 mt-2 pt-2 border-t border-morocco-border/50">
            <span>{t.lines}: <strong className="text-white">{stats.lines}</strong></span>
            <span>{t.level}: <strong className="text-white">{stats.level}</strong></span>
          </div>
        </div>

        {/* Pseudo Submission / Confirmation */}
        {!submittedEntry ? (
          <form onSubmit={handleSubmitScore} className="mb-5 text-left">
            <label className="block text-[11px] font-bold text-morocco-gold uppercase tracking-wider mb-1.5">
              {t.pseudoLabel}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={12}
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value.toUpperCase())}
                placeholder={t.pseudoPlaceholder}
                className="flex-1 px-3 py-2 text-sm font-mono tracking-wider font-bold rounded-lg bg-morocco-night border border-morocco-gold/40 text-white placeholder-gray-500 focus:outline-none focus:border-morocco-gold uppercase"
              />
              <button
                type="submit"
                disabled={submitting || pseudo.trim().length < 3}
                className="px-4 py-2 rounded-lg bg-morocco-green hover:bg-morocco-green-light disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? '...' : t.submitScore}</span>
              </button>
            </div>
            {errorMessage && (
              <div className="flex items-center gap-1 text-xs text-red-400 mt-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        ) : (
          <div className="my-4 p-3 rounded-xl bg-morocco-green/20 border border-morocco-green text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-morocco-green-light">
              <CheckCircle className="w-4 h-4" />
              <span>{t.scoreSubmitted}</span>
            </div>
            {submittedEntry.rank && (
              <div className="text-xs text-white mt-1">
                {t.yourRank} : <strong className="text-morocco-gold font-mono text-base">#{submittedEntry.rank}</strong>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-morocco-red hover:bg-morocco-red-light font-bold text-sm tracking-wider uppercase transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2 text-white"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.restart}</span>
          </button>

          <button
            onClick={onViewLeaderboard}
            className="w-full py-2.5 rounded-xl bg-morocco-night hover:bg-morocco-card border border-morocco-gold/40 text-morocco-gold font-bold text-xs tracking-wider uppercase transition-colors"
          >
            {t.leaderboard}
          </button>
        </div>
      </div>
    </div>
  );
};
