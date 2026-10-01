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
  const triggerHaptic = (ms = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  };

  const handleAction = (action: () => void, hapticMs = 15) => {
    if (disabled) return;
    triggerHaptic(hapticMs);
    action();
  };

  return (
    <div className="w-full max-w-md mx-auto pt-2 pb-1 px-3 grid grid-cols-5 gap-2 select-none touch-manipulation">
      {/* Move Left */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleAction(onMoveLeft)}
        className="flex flex-col items-center justify-center p-3 rounded-xl bg-morocco-card active:bg-morocco-green/40 border border-morocco-border shadow-lg transition-transform active:scale-95 text-white"
        aria-label="Gauche"
      >
        <ArrowLeft className="w-6 h-6 text-morocco-gold" />
      </button>

      {/* Move Right */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleAction(onMoveRight)}
        className="flex flex-col items-center justify-center p-3 rounded-xl bg-morocco-card active:bg-morocco-green/40 border border-morocco-border shadow-lg transition-transform active:scale-95 text-white"
        aria-label="Droite"
      >
        <ArrowRight className="w-6 h-6 text-morocco-gold" />
      </button>

      {/* Rotate */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleAction(onRotate, 25)}
        className="flex flex-col items-center justify-center p-3 rounded-xl bg-morocco-green active:bg-morocco-green-light border border-morocco-gold/40 shadow-lg transition-transform active:scale-95 text-white font-bold"
        aria-label="Rotation"
      >
        <RotateCw className="w-6 h-6 text-white" />
      </button>

      {/* Soft Drop */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleAction(onSoftDrop)}
        className="flex flex-col items-center justify-center p-3 rounded-xl bg-morocco-card active:bg-morocco-red/40 border border-morocco-border shadow-lg transition-transform active:scale-95 text-white"
        aria-label="Bas"
      >
        <ArrowDown className="w-6 h-6 text-morocco-gold" />
      </button>

      {/* Hard Drop */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleAction(onHardDrop, 45)}
        className="flex flex-col items-center justify-center p-3 rounded-xl bg-morocco-red active:bg-morocco-red-light border border-morocco-gold/50 shadow-lg transition-transform active:scale-95 text-white font-bold"
        aria-label="Chute Instantanée"
      >
        <Zap className="w-6 h-6 text-morocco-gold-light" />
      </button>
    </div>
  );
};
