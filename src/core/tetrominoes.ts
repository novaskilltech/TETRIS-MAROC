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
    color: '#00A859', // Vibrant Green
    colorHex: 0x00A859,
    highlightColor: '#4ADE80',
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
    color: '#1D4ED8', // Moroccan Royal Lapis
    colorHex: 0x1D4ED8,
    highlightColor: '#60A5FA',
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
    color: '#EA580C', // Sahara Ochre / Warm Amber
    colorHex: 0xEA580C,
    highlightColor: '#FDBA74',
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
    color: '#D4AF37', // Imperial Moroccan Gold
    colorHex: 0xD4AF37,
    highlightColor: '#FEF08A',
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
    color: '#006233', // Chérifien Deep Emerald
    colorHex: 0x006233,
    highlightColor: '#34D399',
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
    color: '#9333EA', // Marrakech Amethyst / Violet
    colorHex: 0x9333EA,
    highlightColor: '#C084FC',
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
    color: '#C1272D', // Moroccan Flag Deep Red
    colorHex: 0xC1272D,
    highlightColor: '#F87171',
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
