export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type RotationState = 0 | 1 | 2 | 3; // 0 = 0deg, 1 = 90deg, 2 = 180deg, 3 = 270deg

export interface Position {
  x: number;
  y: number;
}

export interface BlockCell {
  filled: boolean;
  type?: TetrominoType;
  color?: string;
  patternId?: number; // for tactile/daltonism pattern distinction
}

export type Grid = BlockCell[][]; // 20 rows x 10 columns (0 is top, 19 is bottom)

export interface ActivePiece {
  type: TetrominoType;
  rotation: RotationState;
  x: number; // grid column (0-9)
  y: number; // grid row (can be negative during spawn)
}

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  singles: number;
  doubles: number;
  triples: number;
  tetrises: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface LeaderboardEntry {
  id: string;
  pseudo: string;
  score: number;
  lines: number;
  level: number;
  createdAt: string;
  rank?: number;
}

export interface StartSessionResponse {
  sessionId: string;
  token: string;
  timestamp: number;
}

export interface SubmitScorePayload {
  sessionId: string;
  token: string;
  pseudo: string;
  score: number;
  lines: number;
  level: number;
  durationSeconds: number;
}

export interface SubmitScoreResponse {
  success: boolean;
  message?: string;
  entry?: LeaderboardEntry;
  rank?: number;
}

export interface BonusState {
  rewindCharges: number;
  canRewind: boolean;
  bombUsed: boolean;
  canTriggerBomb: boolean;
  bombProgress: {
    current: number;
    target: number;
  };
}

