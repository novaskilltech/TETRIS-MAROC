'use client';

import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Award, RefreshCw } from 'lucide-react';
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
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-morocco-card border-2 border-morocco-gold/70 shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-morocco-night border-b border-morocco-gold/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-morocco-gold" />
            <h2 className="text-lg font-black tracking-wider uppercase text-morocco-gold">
              {t.leaderboard}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-morocco-card transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-morocco-card transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <RefreshCw className="w-7 h-7 text-morocco-gold animate-spin" />
              <span className="text-xs uppercase tracking-widest">Chargement du classement...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs">
              {t.noScoresYet}
            </div>
          ) : (
            <div className="space-y-1.5">
              {entries.map((entry, idx) => {
                const rank = entry.rank || idx + 1;
                const isHighlighted = highlightPseudo && entry.pseudo.toUpperCase() === highlightPseudo.toUpperCase();

                let rankBadge = (
                  <span className="w-6 text-center font-mono font-bold text-gray-400 text-xs">
                    #{rank}
                  </span>
                );
                if (rank === 1) {
                  rankBadge = <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />;
                } else if (rank === 2) {
                  rankBadge = <Medal className="w-5 h-5 text-gray-300 shrink-0" />;
                } else if (rank === 3) {
                  rankBadge = <Award className="w-5 h-5 text-amber-600 shrink-0" />;
                }

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isHighlighted
                        ? 'bg-morocco-green/30 border-morocco-gold shadow-lg'
                        : rank <= 3
                        ? 'bg-morocco-night/90 border-morocco-gold/30'
                        : 'bg-morocco-night/50 border-morocco-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 flex items-center justify-center">{rankBadge}</div>
                      <div>
                        <div className="font-mono font-bold text-sm tracking-wider text-white">
                          {entry.pseudo}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {entry.lines} {t.lines.toLowerCase()} • {t.level} {entry.level}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-black text-sm md:text-base text-morocco-gold tracking-tight">
                        {entry.score.toLocaleString()}
                      </div>
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
            className="w-full py-2.5 rounded-xl bg-morocco-card hover:bg-morocco-border border border-morocco-gold/40 text-morocco-gold font-bold text-xs uppercase tracking-wider transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
