'use client';

import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Award, RefreshCw, Crown } from 'lucide-react';
import { LeaderboardEntry } from '@/types/game';
import { Translations } from '@/lib/i18n';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: Translations;
  highlightPseudo?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  t,
  highlightPseudo,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/game/leaderboard');
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setEntries(data.leaderboard);
      }
    } catch (e) {
      console.error('Failed to load leaderboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-morocco-card border-2 border-morocco-gold/70 shadow-[0_0_50px_rgba(212,175,55,0.25)] text-white overflow-hidden zellij-pattern">
        {/* Moorish Arch Header Banner */}
        <div className="relative p-5 bg-gradient-to-b from-morocco-night via-morocco-night/95 to-morocco-card border-b border-morocco-gold/40 flex flex-col items-center">
          {/* Moroccan Khatim Sulayman 8-point gold star motif */}
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rotate-45 bg-morocco-gold shadow-[0_0_8px_#ffd700]"></span>
            <span className="text-[10px] font-mono font-bold text-morocco-gold uppercase tracking-widest">
              ✦ ROYAUME DU MAROC ARCADE ✦
            </span>
            <span className="w-1.5 h-1.5 rotate-45 bg-morocco-gold shadow-[0_0_8px_#ffd700]"></span>
          </div>

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-morocco-gold/15 border border-morocco-gold/50 flex items-center justify-center text-morocco-gold neon-gold-glow">
                <Trophy className="w-5 h-5 text-morocco-gold" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black tracking-wider uppercase text-morocco-gold font-mono">
                  {t.leaderboard}
                </h2>
                <div className="text-[10px] text-gray-400">CLASSEMENT MONDIAL TOP 100</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchLeaderboard}
                className="p-2 rounded-xl text-gray-400 hover:text-morocco-gold hover:bg-morocco-night/80 border border-transparent hover:border-morocco-gold/40 transition-all active:scale-95"
                title="Rafraîchir"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-morocco-night/80 border border-transparent hover:border-morocco-border transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <RefreshCw className="w-8 h-8 text-morocco-gold animate-spin" />
              <span className="text-xs uppercase tracking-widest font-mono text-morocco-gold">Chargement du classement...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-xs font-mono">
              {t.noScoresYet}
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, idx) => {
                const rank = entry.rank || idx + 1;
                const isHighlighted = highlightPseudo && entry.pseudo.toUpperCase() === highlightPseudo.toUpperCase();

                let rankBadge = (
                  <span className="w-7 text-center font-mono font-bold text-gray-400 text-xs">
                    #{rank}
                  </span>
                );
                if (rank === 1) {
                  rankBadge = (
                    <div className="w-7 h-7 rounded-lg bg-yellow-500/20 border border-yellow-400 flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                      <Crown className="w-4 h-4 text-yellow-300" />
                    </div>
                  );
                } else if (rank === 2) {
                  rankBadge = (
                    <div className="w-7 h-7 rounded-lg bg-slate-400/20 border border-slate-300 flex items-center justify-center">
                      <Medal className="w-4 h-4 text-gray-200" />
                    </div>
                  );
                } else if (rank === 3) {
                  rankBadge = (
                    <div className="w-7 h-7 rounded-lg bg-amber-700/20 border border-amber-600 flex items-center justify-center">
                      <Award className="w-4 h-4 text-amber-500" />
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isHighlighted
                        ? 'bg-morocco-green/25 border-morocco-gold shadow-[0_0_20px_rgba(0,168,89,0.35)] ring-1 ring-morocco-gold'
                        : rank === 1
                        ? 'bg-gradient-to-r from-amber-500/15 via-morocco-night/90 to-morocco-night/90 border-yellow-500/50 shadow-md'
                        : rank === 2
                        ? 'bg-gradient-to-r from-slate-400/15 via-morocco-night/90 to-morocco-night/90 border-slate-400/40'
                        : rank === 3
                        ? 'bg-gradient-to-r from-amber-700/15 via-morocco-night/90 to-morocco-night/90 border-amber-600/40'
                        : 'bg-morocco-night/70 border-morocco-border hover:border-morocco-border/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center">{rankBadge}</div>
                      <div>
                        <div className="font-mono font-black text-sm tracking-wider text-white flex items-center gap-1.5">
                          <span>{entry.pseudo}</span>
                          {isHighlighted && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-morocco-green text-white font-bold uppercase">
                              VOUS
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {entry.lines} {t.lines.toLowerCase()} • {t.level} {entry.level}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-black text-sm md:text-base text-morocco-gold tracking-tight drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono">PTS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-morocco-night border-t border-morocco-border text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-morocco-card hover:bg-morocco-border border border-morocco-gold/40 text-morocco-gold font-bold text-xs uppercase tracking-wider transition-all active:scale-98"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
