'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, Zap } from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  disabled?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  disabled = false,
}) => {
  // Synthesized tactile arcade micro-click sound
  const playClickSound = (freq = 640) => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch (e) {}
  };

  const triggerHaptic = (ms = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  };

  const handleAction = (action: () => void, hapticMs = 15, soundFreq = 640) => {
    if (disabled) return;
    triggerHaptic(hapticMs);
    playClickSound(soundFreq);
    action();
  };

  return (
    <div className="w-full max-w-md mx-auto pt-1 pb-2 px-2 select-none touch-manipulation">
      {/* 2-Cluster Dual-Thumb Ergonomic Arcade Gamepad */}
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* LEFT THUMB CLUSTER: Directional Navigation [◀], [▶], and [▼ SOFT DROP] */}
        <div className="col-span-6 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            {/* Left Button */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleAction(onMoveLeft, 12, 540)}
              className="w-13 h-13 p-3 rounded-2xl bg-morocco-card border-2 border-morocco-green/50 text-morocco-green-light flex items-center justify-center shadow-[0_5px_0_#00381c] active:translate-y-1 active:shadow-[0_1px_0_#00381c] active:bg-morocco-green active:text-white transition-all duration-75 neon-emerald-glow"
              aria-label="Gauche"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Right Button */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleAction(onMoveRight, 12, 540)}
              className="w-13 h-13 p-3 rounded-2xl bg-morocco-card border-2 border-morocco-green/50 text-morocco-green-light flex items-center justify-center shadow-[0_5px_0_#00381c] active:translate-y-1 active:shadow-[0_1px_0_#00381c] active:bg-morocco-green active:text-white transition-all duration-75 neon-emerald-glow"
              aria-label="Droite"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Soft Drop Button [▼] */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleAction(onSoftDrop, 15, 480)}
            className="w-28 py-2 rounded-xl bg-morocco-night border border-morocco-border text-gray-300 flex items-center justify-center gap-1.5 shadow-[0_4px_0_#0a111a] active:translate-y-1 active:shadow-[0_1px_0_#0a111a] active:text-white transition-all duration-75"
            aria-label="Descente Douce"
          >
            <ArrowDown className="w-4 h-4 text-morocco-gold" />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Bas</span>
          </button>
        </div>

        {/* RIGHT THUMB CLUSTER: [↻ ROTATE CW] and [⚡ HARD DROP] */}
        <div className="col-span-6 flex flex-col items-center gap-1.5">
          {/* Rotate Button (Hero Action) */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleAction(onRotate, 25, 750)}
            className="w-14 h-14 rounded-full bg-gradient-to-b from-morocco-green to-morocco-green-dark border-2 border-morocco-gold text-white flex items-center justify-center shadow-[0_5px_0_#002b15] active:translate-y-1 active:shadow-[0_1px_0_#002b15] active:brightness-125 transition-all duration-75 shadow-[0_0_18px_rgba(89,223,137,0.45)]"
            aria-label="Rotation"
          >
            <RotateCw className="w-7 h-7 text-white" />
          </button>

          {/* Hard Drop Action Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleAction(onHardDrop, 45, 920)}
            className="w-32 py-2 rounded-xl bg-gradient-to-r from-morocco-red-dark to-morocco-red border border-morocco-gold/60 text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_5px_0_#490003] active:translate-y-1 active:shadow-[0_1px_0_#490003] transition-all duration-75 shadow-[0_0_14px_rgba(255,180,171,0.35)]"
            aria-label="Chute Instantanée"
          >
            <Zap className="w-4 h-4 text-morocco-gold-light" />
            <span className="text-[10px] font-mono font-black tracking-widest uppercase">DROP ⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};
