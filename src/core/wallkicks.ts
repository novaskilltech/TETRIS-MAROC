import type { RotationState, TetrominoType } from '../types/game.ts';

// Wall kick tests are 5 offset tuples [dx, dy] tested in order.
// In Tetris guideline, positive dy is upwards, but in our matrix index y goes downwards.
// We map offsets directly to grid [dx, dy] where +dx is right, +dy is down.

type KickData = Record<string, [number, number][]>;

// For J, L, S, T, Z
const JLSTZ_KICKS: KickData = {
  '0->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1->0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1->2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3->2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3->0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

// For I piece
const I_KICKS: KickData = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

export function getWallKicks(
  type: TetrominoType,
  fromRot: RotationState,
  toRot: RotationState
): [number, number][] {
  if (type === 'O') {
    return [[0, 0]];
  }
  const key = `${fromRot}->${toRot}`;
  if (type === 'I') {
    return I_KICKS[key] || [[0, 0]];
  }
  return JLSTZ_KICKS[key] || [[0, 0]];
}
