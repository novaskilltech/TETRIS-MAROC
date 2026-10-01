import type {
  Grid,
  BlockCell,
  TetrominoType,
  RotationState,
  ActivePiece,
  GameStats,
  Position,
} from '../types/game.ts';
import { TETROMINOES, ALL_PIECE_TYPES } from './tetrominoes.ts';
import { getWallKicks } from './wallkicks.ts';

export const GRID_COLS = 10;
export const GRID_ROWS = 20;

export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, (): BlockCell => ({ filled: false }))
  );
}

export class TetrisEngine {
  private grid: Grid;
  private currentPiece: ActivePiece | null = null;
  private bag: TetrominoType[] = [];
  private nextPieces: TetrominoType[] = [];
  private stats: GameStats;
  private gameOver: boolean = false;
  private lockDelayMs: number = 500;
  private lockTimer: number | null = null;
  private moveResetsCount: number = 0;
  private maxMoveResets: number = 15;

  constructor() {
    this.grid = createEmptyGrid();
    this.stats = {
      score: 0,
      lines: 0,
      level: 1,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
    };
    this.refillBagIfNeeded();
    this.spawnNextPiece();
  }

  // --- 7-BAG RANDOMIZER ---
  private refillBagIfNeeded(): void {
    while (this.nextPieces.length < 7) {
      if (this.bag.length === 0) {
        this.bag = [...ALL_PIECE_TYPES];
        // Fisher-Yates shuffle
        for (let i = this.bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
      }
      this.nextPieces.push(this.bag.pop()!);
    }
  }

  public getNextPiece(): TetrominoType {
    this.refillBagIfNeeded();
    return this.nextPieces[0];
  }

  // --- SPAWN PIECE ---
  public spawnNextPiece(): boolean {
    this.refillBagIfNeeded();
    const type = this.nextPieces.shift()!;
    this.refillBagIfNeeded();

    const shape = TETROMINOES[type].shapes[0];
    const pieceWidth = shape[0].length;
    // Spawn horizontally centered, top row
    const spawnX = Math.floor((GRID_COLS - pieceWidth) / 2);
    // Find highest non-empty row in shape to align properly at y = 0
    let firstFilledRow = 0;
    for (let r = 0; r < shape.length; r++) {
      if (shape[r].some((c) => c !== 0)) {
        firstFilledRow = r;
        break;
      }
    }
    const spawnY = -firstFilledRow;

    this.currentPiece = {
      type,
      rotation: 0,
      x: spawnX,
      y: spawnY,
    };

    this.moveResetsCount = 0;
    this.lockTimer = null;

    // Check collision on spawn (immediate Game Over condition)
    if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.rotation, this.currentPiece.type)) {
      this.gameOver = true;
      return false;
    }

    return true;
  }

  // --- COLLISION CHECKING ---
  public checkCollision(
    x: number,
    y: number,
    rotation: RotationState,
    type: TetrominoType
  ): boolean {
    const shape = TETROMINOES[type].shapes[rotation];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const gridX = x + c;
          const gridY = y + r;

          // Wall boundaries
          if (gridX < 0 || gridX >= GRID_COLS) {
            return true;
          }
          // Floor boundary
          if (gridY >= GRID_ROWS) {
            return true;
          }
          // Above board is allowed during spawn
          if (gridY < 0) {
            continue;
          }
          // Grid block collision
          if (this.grid[gridY][gridX].filled) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // --- MOVEMENT ---
  public moveLeft(): boolean {
    if (this.gameOver || !this.currentPiece) return false;
    if (!this.checkCollision(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.rotation, this.currentPiece.type)) {
      this.currentPiece.x -= 1;
      this.handlePieceMoved();
      return true;
    }
    return false;
  }

  public moveRight(): boolean {
    if (this.gameOver || !this.currentPiece) return false;
    if (!this.checkCollision(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.rotation, this.currentPiece.type)) {
      this.currentPiece.x += 1;
      this.handlePieceMoved();
      return true;
    }
    return false;
  }

  public rotate(clockwise: boolean = true): boolean {
    if (this.gameOver || !this.currentPiece) return false;

    const fromRot = this.currentPiece.rotation;
    const toRot: RotationState = (
      clockwise ? (fromRot + 1) % 4 : (fromRot + 3) % 4
    ) as RotationState;

    const kicks = getWallKicks(this.currentPiece.type, fromRot, toRot);

    for (const [dx, dy] of kicks) {
      const testX = this.currentPiece.x + dx;
      const testY = this.currentPiece.y + dy;

      if (!this.checkCollision(testX, testY, toRot, this.currentPiece.type)) {
        this.currentPiece.x = testX;
        this.currentPiece.y = testY;
        this.currentPiece.rotation = toRot;
        this.handlePieceMoved();
        return true;
      }
    }

    return false;
  }

  public softDrop(): { moved: boolean; locked: boolean; linesCleared: number } {
    if (this.gameOver || !this.currentPiece) {
      return { moved: false, locked: false, linesCleared: 0 };
    }

    if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation, this.currentPiece.type)) {
      this.currentPiece.y += 1;
      this.stats.score += 1; // 1 pt per cell for soft drop
      return { moved: true, locked: false, linesCleared: 0 };
    } else {
      // Cannot move down -> lock piece
      const linesCleared = this.lockPiece();
      return { moved: false, locked: true, linesCleared };
    }
  }

  public hardDrop(): { droppedRows: number; linesCleared: number } {
    if (this.gameOver || !this.currentPiece) {
      return { droppedRows: 0, linesCleared: 0 };
    }

    let droppedRows = 0;
    while (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation, this.currentPiece.type)) {
      this.currentPiece.y += 1;
      droppedRows += 1;
    }

    this.stats.score += droppedRows * 2; // 2 pts per cell for hard drop
    const linesCleared = this.lockPiece();
    return { droppedRows, linesCleared };
  }

  public getGhostPosition(): Position | null {
    if (!this.currentPiece) return null;

    let ghostY = this.currentPiece.y;
    while (!this.checkCollision(this.currentPiece.x, ghostY + 1, this.currentPiece.rotation, this.currentPiece.type)) {
      ghostY += 1;
    }
    return { x: this.currentPiece.x, y: ghostY };
  }

  private handlePieceMoved(): void {
    if (this.moveResetsCount < this.maxMoveResets) {
      this.moveResetsCount += 1;
      this.lockTimer = null;
    }
  }

  // --- LOCK PIECE & CLEAR LINES ---
  public lockPiece(): number {
    if (!this.currentPiece) return 0;

    const shape = TETROMINOES[this.currentPiece.type].shapes[this.currentPiece.rotation];
    const def = TETROMINOES[this.currentPiece.type];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const gridX = this.currentPiece.x + c;
          const gridY = this.currentPiece.y + r;

          // If locked above top of visible grid, game over
          if (gridY < 0) {
            this.gameOver = true;
            this.currentPiece = null;
            return 0;
          }

          if (gridY < GRID_ROWS && gridX >= 0 && gridX < GRID_COLS) {
            this.grid[gridY][gridX] = {
              filled: true,
              type: this.currentPiece.type,
              color: def.color,
              patternId: def.patternId,
            };
          }
        }
      }
    }

    this.currentPiece = null;
    const linesCleared = this.clearFullLines();

    if (!this.gameOver) {
      const spawned = this.spawnNextPiece();
      if (!spawned) {
        this.gameOver = true;
      }
    }

    return linesCleared;
  }

  public clearFullLines(): number {
    const fullRowIndices: number[] = [];

    for (let r = 0; r < GRID_ROWS; r++) {
      if (this.grid[r].every((cell) => cell.filled)) {
        fullRowIndices.push(r);
      }
    }

    const count = fullRowIndices.length;
    if (count === 0) return 0;

    // Filter out full rows and unshift empty rows at top
    const newGrid = this.grid.filter((_, idx) => !fullRowIndices.includes(idx));
    while (newGrid.length < GRID_ROWS) {
      newGrid.unshift(Array.from({ length: GRID_COLS }, (): BlockCell => ({ filled: false })));
    }
    this.grid = newGrid;

    // Update lines and score
    this.stats.lines += count;
    const prevLevel = this.stats.level;
    this.stats.level = Math.floor(this.stats.lines / 10) + 1;

    // Classic Nintendo/BPS scoring formula
    let baseScore = 0;
    if (count === 1) {
      baseScore = 100 * prevLevel;
      this.stats.singles += 1;
    } else if (count === 2) {
      baseScore = 300 * prevLevel;
      this.stats.doubles += 1;
    } else if (count === 3) {
      baseScore = 500 * prevLevel;
      this.stats.triples += 1;
    } else if (count >= 4) {
      baseScore = 800 * prevLevel;
      this.stats.tetrises += 1;
    }

    this.stats.score += baseScore;

    return count;
  }

  // --- DROP INTERVAL BY LEVEL ---
  public getDropIntervalMs(): number {
    const lvl = this.stats.level;
    if (lvl === 1) return 1000;
    if (lvl === 2) return 850;
    if (lvl === 3) return 700;
    if (lvl === 4) return 550;
    if (lvl === 5) return 450;
    if (lvl === 6) return 350;
    if (lvl === 7) return 280;
    if (lvl === 8) return 200;
    if (lvl === 9) return 150;
    return Math.max(80, 150 - (lvl - 9) * 10);
  }

  // --- GETTERS & RESET ---
  public getGrid(): Grid {
    return this.grid;
  }

  public getActivePiece(): ActivePiece | null {
    return this.currentPiece;
  }

  public getStats(): GameStats {
    return { ...this.stats };
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }

  public reset(): void {
    this.grid = createEmptyGrid();
    this.stats = {
      score: 0,
      lines: 0,
      level: 1,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
    };
    this.gameOver = false;
    this.bag = [];
    this.nextPieces = [];
    this.refillBagIfNeeded();
    this.spawnNextPiece();
  }
}
