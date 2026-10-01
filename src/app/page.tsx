'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TetrisEngine } from '@/core/engine';
import { TetrisCanvas3D } from '@/components/game/TetrisCanvas3D';
import { TouchControls } from '@/components/game/TouchControls';
import { StatsPanel } from '@/components/game/StatsPanel';
import { GameOverModal } from '@/components/game/GameOverModal';
import { PauseModal } from '@/components/game/PauseModal';
import { LeaderboardModal } from '@/components/leaderboard/LeaderboardModal';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { soundManager } from '@/audio/soundManager';
import { DICTIONARY, Language } from '@/lib/i18n';
import { ThemeId } from '@/types/theme';
import { Play, Trophy, Volume2, VolumeX, Globe, ArrowLeft, Gamepad2 } from 'lucide-react';
import { Grid, ActivePiece, Position, TetrominoType } from '@/types/game';

export default function TetrisMarocApp() {
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [lang, setLang] = useState<Language>('fr');
  const [isMuted, setIsMuted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [themeId, setThemeId] = useState<ThemeId>('maroc');

  // Modals state
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Anti-cheat session
  const [sessionId, setSessionId] = useState('');
  const [sessionToken, setSessionToken] = useState('');

  // Engine & UI state
  const engineRef = useRef<TetrisEngine | null>(null);
  const [grid, setGrid] = useState<Grid>([]);
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [ghostPos, setGhostPos] = useState<Position | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType>('I');
  const [clearedLines, setClearedLines] = useState<number[]>([]);
  const [stats, setStats] = useState({
    score: 0,
    lines: 0,
    level: 1,
    singles: 0,
    doubles: 0,
    triples: 0,
    tetrises: 0,
  });

  const lastDropTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const t = DICTIONARY[lang];

  // Initialize engine & local storage
  useEffect(() => {
    engineRef.current = new TetrisEngine();
    setGrid(engineRef.current.getGrid());
    setActivePiece(engineRef.current.getActivePiece());
    setGhostPos(engineRef.current.getGhostPosition());
    setNextPiece(engineRef.current.getNextPiece());
    setStats(engineRef.current.getStats());

    if (typeof window !== 'undefined') {
      const savedHigh = localStorage.getItem('tetris_maroc_highscore');
      if (savedHigh) setHighScore(parseInt(savedHigh, 10));

      const savedLang = localStorage.getItem('tetris_maroc_lang') as Language;
      if (savedLang === 'fr' || savedLang === 'en') setLang(savedLang);

      const savedTheme = localStorage.getItem('tetris_maroc_theme') as ThemeId;
      if (savedTheme === 'maroc' || savedTheme === 'galaxy' || savedTheme === 'beach') {
        setThemeId(savedTheme);
      }

      setIsMuted(soundManager.isMuted());
    }
  }, []);

  const handleSelectTheme = (newTheme: ThemeId) => {
    setThemeId(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tetris_maroc_theme', newTheme);
    }
  };

  const syncStateFromEngine = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setGrid([...engine.getGrid()]);
    setActivePiece(engine.getActivePiece() ? { ...engine.getActivePiece()! } : null);
    setGhostPos(engine.getGhostPosition());
    setNextPiece(engine.getNextPiece());
    const currentStats = engine.getStats();
    setStats(currentStats);

    if (engine.isGameOver() && !isGameOver) {
      setIsGameOver(true);
      soundManager.playGameOver();

      if (currentStats.score > highScore) {
        setHighScore(currentStats.score);
        setIsNewHighScore(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('tetris_maroc_highscore', currentStats.score.toString());
        }
      }
    }
  }, [highScore, isGameOver]);

  // Start new game session
  const startGame = async () => {
    soundManager.init();
    soundManager.playButtonClick();

    if (!engineRef.current) {
      engineRef.current = new TetrisEngine();
    } else {
      engineRef.current.reset();
    }

    setIsGameOver(false);
    setIsPaused(false);
    setIsNewHighScore(false);
    setClearedLines([]);

    syncStateFromEngine();
    setScreen('game');

    try {
      const res = await fetch('/api/game/start', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setSessionToken(data.token);
      }
    } catch (e) {
      console.warn('Failed to obtain server session:', e);
    }
  };

  // Game Loop (Gravity drop)
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (screen === 'game' && !isPaused && !isGameOver && engineRef.current) {
        const dropInterval = engineRef.current.getDropIntervalMs();

        if (timestamp - lastDropTimeRef.current >= dropInterval) {
          lastDropTimeRef.current = timestamp;
          const res = engineRef.current.softDrop();
          if (res.locked) {
            if (res.linesCleared > 0) {
              soundManager.playLineClear(res.linesCleared);
            }
          }
          syncStateFromEngine();
        }
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    },
    [screen, isPaused, isGameOver, syncStateFromEngine]
  );

  useEffect(() => {
    lastDropTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameLoop]);

  // Player Actions
  const handleMoveLeft = () => {
    if (!engineRef.current || isPaused || isGameOver) return;
    if (engineRef.current.moveLeft()) {
      soundManager.playMove();
      syncStateFromEngine();
    }
  };

  const handleMoveRight = () => {
    if (!engineRef.current || isPaused || isGameOver) return;
    if (engineRef.current.moveRight()) {
      soundManager.playMove();
      syncStateFromEngine();
    }
  };

  const handleRotate = () => {
    if (!engineRef.current || isPaused || isGameOver) return;
    if (engineRef.current.rotate(true)) {
      soundManager.playRotate();
      syncStateFromEngine();
    }
  };

  const handleSoftDrop = () => {
    if (!engineRef.current || isPaused || isGameOver) return;
    const res = engineRef.current.softDrop();
    if (res.moved) {
      soundManager.playSoftDrop();
    } else if (res.locked && res.linesCleared > 0) {
      soundManager.playLineClear(res.linesCleared);
    }
    syncStateFromEngine();
  };

  const handleHardDrop = () => {
    if (!engineRef.current || isPaused || isGameOver) return;
    const res = engineRef.current.hardDrop();
    soundManager.playHardDrop();
    if (res.linesCleared > 0) {
      setTimeout(() => soundManager.playLineClear(res.linesCleared), 80);
    }
    syncStateFromEngine();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'game') return;

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPaused || isGameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMoveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMoveRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleRotate();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleSoftDrop();
          break;
        case ' ':
          e.preventDefault();
          handleHardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isPaused, isGameOver]);

  // Touch Swipe Gesture on Canvas
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < 15 && absY < 15 && elapsed < 250) {
      handleRotate();
    } else if (absX > absY && absX > 25) {
      if (dx > 0) handleMoveRight();
      else handleMoveLeft();
    } else if (absY > absX && dy > 30) {
      if (dy > 80) handleHardDrop();
      else handleSoftDrop();
    }

    touchStartRef.current = null;
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const toggleLanguage = () => {
    const next = lang === 'fr' ? 'en' : 'fr';
    setLang(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tetris_maroc_lang', next);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between text-white selection:bg-morocco-gold selection:text-black">
      {/* ================= HOME SCREEN ================= */}
      {screen === 'home' && (
        <div className="w-full flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-md mx-auto text-center animate-fade-in">
          {/* Header tools */}
          <div className="w-full flex items-center justify-between mb-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-morocco-card border border-morocco-border hover:border-morocco-gold/50 text-xs font-bold text-gray-300 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-morocco-gold" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-morocco-card border border-morocco-border hover:border-morocco-gold/50 text-gray-300 transition-colors"
              title={isMuted ? t.soundOff : t.soundOn}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-morocco-red" /> : <Volume2 className="w-4 h-4 text-morocco-green" />}
            </button>
          </div>

          {/* Emblem & Title */}
          <div className="relative mb-5">
            <div className="w-20 h-20 mx-auto mb-3 relative flex items-center justify-center rounded-3xl bg-morocco-night border-2 border-morocco-gold shadow-[0_0_30px_rgba(212,175,55,0.25)]">
              <svg viewBox="0 0 100 100" className="w-14 h-14 fill-morocco-green filter drop-shadow-[0_0_8px_rgba(0,168,89,0.6)]">
                <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" />
              </svg>
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-morocco-red/20 border border-morocco-red text-morocco-red-light text-[10px] font-black uppercase tracking-widest mb-1.5">
              {t.arcadeBadge}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-md">
              <span className="text-morocco-red-light">TÉTRIS</span>{' '}
              <span className="text-morocco-gold">3D</span>{' '}
              <span className="text-morocco-green-light">MAROC</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              {t.gameSubtitle}
            </p>
          </div>

          {/* High Score Badge */}
          {highScore > 0 && (
            <div className="mb-4 px-4 py-1.5 rounded-xl bg-morocco-card border border-morocco-gold/40 flex items-center gap-2 shadow-inner">
              <Trophy className="w-4 h-4 text-morocco-gold" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">{t.highScore}:</span>
              <span className="text-base font-black font-mono text-morocco-gold">{highScore.toLocaleString()}</span>
            </div>
          )}

          {/* Theme Selector on Home Screen */}
          <div className="w-full mb-5">
            <ThemeSelector currentTheme={themeId} onSelectTheme={handleSelectTheme} t={t} />
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2.5 mb-6">
            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-morocco-red via-morocco-red-light to-morocco-red border-2 border-morocco-gold shadow-[0_0_25px_rgba(193,39,45,0.4)] hover:shadow-[0_0_35px_rgba(193,39,45,0.6)] font-black text-xl tracking-widest uppercase transition-transform active:scale-95 flex items-center justify-center gap-2 text-white"
            >
              <Play className="w-6 h-6 fill-current text-morocco-gold-light" />
              <span>{t.play}</span>
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="w-full py-3 rounded-2xl bg-morocco-night hover:bg-morocco-card border border-morocco-gold/50 text-morocco-gold font-bold text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Trophy className="w-4 h-4 text-morocco-gold" />
              <span>{t.leaderboard}</span>
            </button>
          </div>

          {/* Quick instructions */}
          <div className="w-full p-3.5 rounded-2xl bg-morocco-card/60 border border-morocco-border text-left text-xs text-gray-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-morocco-gold font-bold uppercase tracking-wider text-[11px]">
              <Gamepad2 className="w-4 h-4" />
              <span>{t.controlsTitle}</span>
            </div>
            <p className="text-[11px] leading-relaxed">{t.controlsKeyboard}</p>
            <p className="text-[11px] leading-relaxed">{t.controlsTouch}</p>
          </div>
        </div>
      )}

      {/* ================= GAMEPLAY SCREEN ================= */}
      {screen === 'game' && (
        <div className="w-full flex-1 flex flex-col max-w-md mx-auto h-full px-2 py-2 justify-between">
          {/* Top Bar with Live Theme Selector */}
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <button
              onClick={() => setScreen('home')}
              className="p-1.5 rounded-lg bg-morocco-card border border-morocco-border text-gray-300 hover:text-white"
              title={t.quit}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Live Theme Switcher */}
            <ThemeSelector currentTheme={themeId} onSelectTheme={handleSelectTheme} t={t} compact />

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg bg-morocco-card border border-morocco-border text-gray-300"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-morocco-red" /> : <Volume2 className="w-3.5 h-3.5 text-morocco-green" />}
              </button>
            </div>
          </div>

          {/* Main Play Area */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 min-h-0">
            {/* Desktop / Lateral Stats on wide screens */}
            <div className="hidden md:flex flex-col gap-2">
              <StatsPanel
                stats={stats}
                nextPiece={nextPiece}
                highScore={highScore}
                isPaused={isPaused}
                isMuted={isMuted}
                themeId={themeId}
                onSelectTheme={handleSelectTheme}
                onTogglePause={() => setIsPaused((p) => !p)}
                onToggleMute={toggleSound}
                t={t}
              />
            </div>

            {/* 3D WebGL Canvas */}
            <div
              className="md:col-span-3 flex-1 flex flex-col items-center justify-center relative touch-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <TetrisCanvas3D
                grid={grid}
                activePiece={activePiece}
                ghostPos={ghostPos}
                clearedLines={clearedLines}
                isPaused={isPaused}
                themeId={themeId}
              />

              {/* Mobile overlay HUD badge (score & next piece) */}
              <div className="md:hidden absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/30 shadow-lg">
                  <div className="text-[9px] text-gray-300 font-bold uppercase">{t.score}</div>
                  <div className="text-base font-black font-mono text-white">{stats.score.toLocaleString()}</div>
                </div>

                <div className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/30 shadow-lg flex items-center gap-2">
                  <div className="text-[9px] text-gray-300 font-bold uppercase">{t.nextPiece}</div>
                  <div className="text-xs font-black font-mono text-white">{nextPiece}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Touch Controls */}
          <div className="w-full mt-2">
            <TouchControls
              onMoveLeft={handleMoveLeft}
              onMoveRight={handleMoveRight}
              onRotate={handleRotate}
              onSoftDrop={handleSoftDrop}
              onHardDrop={handleHardDrop}
              disabled={isPaused || isGameOver}
            />
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}
      <PauseModal
        isOpen={isPaused && !isGameOver}
        onResume={() => setIsPaused(false)}
        onRestart={startGame}
        onQuit={() => {
          setIsPaused(false);
          setScreen('home');
        }}
        isMuted={isMuted}
        onToggleMute={toggleSound}
        lang={lang}
        onToggleLang={toggleLanguage}
        themeId={themeId}
        onSelectTheme={handleSelectTheme}
        t={t}
      />

      {isGameOver && (
        <GameOverModal
          stats={stats}
          sessionId={sessionId}
          sessionToken={sessionToken}
          isNewHighScore={isNewHighScore}
          onRestart={startGame}
          onViewLeaderboard={() => setShowLeaderboard(true)}
          t={t}
        />
      )}

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        t={t}
      />
    </main>
  );
}
