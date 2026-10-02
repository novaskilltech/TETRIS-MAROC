import type { TetrominoType, RotationState } from '../types/game.ts';

export interface TetrominoDefinition {
  type: TetrominoType;
  color: string;
  colorHex: number;
  highlightColor: string;
  patternId: number; // 1 to 7 for visual accessibility (embossed icons/stripes)
  shapes: Record<RotationState, number[][]>;
}

// Standard 4-state SRS matrices (row-major: [y][x])
export const TETROMINOES: Record<TetrominoType, TetrominoDefinition> = {
  I: {
    type: 'I',
    color: '#67E8F9', // Pastel Aqua / Mint Cyan
    colorHex: 0x67E8F9,
    highlightColor: '#CFFAFE',
    patternId: 1,
    shapes: {
      0: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      1: [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
      2: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      3: [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
    },
  },
  J: {
    type: 'J',
    color: '#93C5FD', // Pastel Sky Blue
    colorHex: 0x93C5FD,
    highlightColor: '#DBEAFE',
    patternId: 2,
    shapes: {
      0: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      1: [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
      2: [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      3: [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
    },
  },
  L: {
    type: 'L',
    color: '#FDBA74', // Pastel Peach / Apricot
    colorHex: 0xFDBA74,
    highlightColor: '#FFEDD5',
    patternId: 3,
    shapes: {
      0: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      1: [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
      2: [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
      ],
      3: [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
    },
  },
  O: {
    type: 'O',
    color: '#FDE047', // Pastel Lemon Gold
    colorHex: 0xFDE047,
    highlightColor: '#FEFCE8',
    patternId: 4,
    shapes: {
      0: [
        [1, 1],
        [1, 1],
      ],
      1: [
        [1, 1],
        [1, 1],
      ],
      2: [
        [1, 1],
        [1, 1],
      ],
      3: [
        [1, 1],
        [1, 1],
      ],
    },
  },
  S: {
    type: 'S',
    color: '#86EFAC', // Pastel Pistachio / Mint Green (replaces dark green)
    colorHex: 0x86EFAC,
    highlightColor: '#DCFCE7',
    patternId: 5,
    shapes: {
      0: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      1: [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
      2: [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0],
      ],
      3: [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    },
  },
  T: {
    type: 'T',
    color: '#D8B4FE', // Pastel Lilac / Lavender
    colorHex: 0xD8B4FE,
    highlightColor: '#F3E8FF',
    patternId: 6,
    shapes: {
      0: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      1: [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
      2: [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      3: [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    },
  },
  Z: {
    type: 'Z',
    color: '#FCA5A5', // Pastel Coral Rose (replaces dark red)
    colorHex: 0xFCA5A5,
    highlightColor: '#FFE4E6',
    patternId: 7,
    shapes: {
      0: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      1: [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
      ],
      2: [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1],
      ],
      3: [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
      ],
    },
  },
};

export const ALL_PIECE_TYPES: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
