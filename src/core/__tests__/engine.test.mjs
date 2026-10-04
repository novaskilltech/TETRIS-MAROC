import test from 'node:test';
import assert from 'node:assert/strict';

// Import compiled or testable logic
import { TetrisEngine, GRID_COLS, GRID_ROWS, createEmptyGrid } from '../engine.ts';
import { TETROMINOES, ALL_PIECE_TYPES } from '../tetrominoes.ts';

test('Grid initialization: creates 20 rows x 10 cols empty grid', () => {
  const grid = createEmptyGrid();
  assert.equal(grid.length, GRID_ROWS);
  assert.equal(grid[0].length, GRID_COLS);
  assert.equal(grid[0][0].filled, false);
  assert.equal(grid[19][9].filled, false);
});

test('Tetrominoes: all 7 shapes exist with 4 rotation states', () => {
  assert.equal(ALL_PIECE_TYPES.length, 7);
  for (const type of ALL_PIECE_TYPES) {
    const def = TETROMINOES[type];
    assert.ok(def, `Tetromino ${type} must exist`);
    assert.equal(typeof def.color, 'string');
    assert.equal(typeof def.patternId, 'number');
    for (let r = 0; r < 4; r++) {
      assert.ok(Array.isArray(def.shapes[r]), `Shape ${type} rotation ${r} must be an array`);
      // Every piece has exactly 4 minos (blocks)
      let minoCount = 0;
      for (const row of def.shapes[r]) {
        for (const cell of row) {
          if (cell !== 0) minoCount++;
        }
      }
      assert.equal(minoCount, 4, `Tetromino ${type} rotation ${r} must contain exactly 4 blocks`);
    }
  }
});

test('TetrisEngine: spawns active piece and provides next piece preview', () => {
  const engine = new TetrisEngine();
  const active = engine.getActivePiece();
  assert.ok(active, 'Active piece should be defined on spawn');
  assert.ok(ALL_PIECE_TYPES.includes(active.type), 'Active piece must be a valid tetromino');
  assert.equal(active.rotation, 0);

  const next = engine.getNextPiece();
  assert.ok(ALL_PIECE_TYPES.includes(next), 'Next piece must be a valid tetromino');

  const stats = engine.getStats();
  assert.equal(stats.score, 0);
  assert.equal(stats.lines, 0);
  assert.equal(stats.level, 1);
  assert.equal(engine.isGameOver(), false);
});

test('TetrisEngine: horizontal movement respects grid boundaries', () => {
  const engine = new TetrisEngine();
  const initialX = engine.getActivePiece().x;

  // Move left multiple times until hitting the wall
  for (let i = 0; i < 15; i++) {
    engine.moveLeft();
  }
  const minX = engine.getActivePiece().x;
  assert.ok(minX >= 0, `Piece x (${minX}) must not go below 0`);

  // Move right multiple times until hitting right wall
  for (let i = 0; i < 15; i++) {
    engine.moveRight();
  }
  const maxX = engine.getActivePiece().x;
  assert.ok(maxX <= GRID_COLS - 2, `Piece x (${maxX}) must stay inside grid`);
});

test('TetrisEngine: rotation cycles through states with SRS', () => {
  const engine = new TetrisEngine();
  const initialRot = engine.getActivePiece().rotation;
  assert.equal(initialRot, 0);

  engine.rotate(true); // clockwise
  assert.equal(engine.getActivePiece().rotation, 1);

  engine.rotate(true);
  assert.equal(engine.getActivePiece().rotation, 2);

  engine.rotate(true);
  assert.equal(engine.getActivePiece().rotation, 3);

  engine.rotate(true);
  assert.equal(engine.getActivePiece().rotation, 0);

  engine.rotate(false); // counter-clockwise
  assert.equal(engine.getActivePiece().rotation, 3);
});

test('TetrisEngine: hardDrop lands piece, awards 2 pts per dropped row, and locks piece', () => {
  const engine = new TetrisEngine();
  const { droppedRows } = engine.hardDrop();
  assert.ok(droppedRows > 0, 'Hard drop should drop at least 1 row');
  
  const stats = engine.getStats();
  assert.equal(stats.score, droppedRows * 2, 'Hard drop must award 2 pts per dropped row');
});

test('TetrisEngine: clearFullLines correctly detects and clears rows and updates score', () => {
  const engine = new TetrisEngine();
  const grid = engine.getGrid();

  // Manually fill bottom row (row 19)
  for (let c = 0; c < GRID_COLS; c++) {
    grid[19][c] = { filled: true, type: 'I', color: '#006233', patternId: 1 };
  }

  const cleared = engine.clearFullLines();
  assert.equal(cleared, 1, 'Should have cleared 1 full row');

  const stats = engine.getStats();
  assert.equal(stats.lines, 1);
  assert.equal(stats.score, 100, '1 line clear at level 1 awards 100 points');
  assert.equal(engine.getGrid()[0][0].filled, false, 'Top row should be empty');
  assert.equal(engine.getGrid()[19][0].filled, false, 'Row 19 should now be empty');
});

test('TetrisEngine: Tetris (4 lines) clears 4 rows and awards 800 pts', () => {
  const engine = new TetrisEngine();
  const grid = engine.getGrid();

  // Manually fill bottom 4 rows (16, 17, 18, 19)
  for (let r = 16; r < 20; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      grid[r][c] = { filled: true, type: 'O', color: '#D4AF37', patternId: 4 };
    }
  }

  const cleared = engine.clearFullLines();
  assert.equal(cleared, 4, 'Should have cleared 4 rows');

  const stats = engine.getStats();
  assert.equal(stats.lines, 4);
  assert.equal(stats.score, 800, 'Tetris clear at level 1 awards 800 points');
  assert.equal(stats.tetrises, 1);
});

test('TetrisEngine Bonus: starts with 1 Rewind charge available', () => {
  const engine = new TetrisEngine();
  const bonus = engine.getBonusState();
  assert.equal(bonus.rewindCharges, 1, 'Player starts with 1 Rewind charge');
  assert.equal(bonus.canRewind, false, 'Cannot rewind before any piece has locked');
  assert.equal(bonus.bombUsed, false, 'Bomb has not been used');
  assert.equal(bonus.canTriggerBomb, false, 'Bomb locked at 0 lines');
  assert.equal(bonus.bombProgress.target, 15);
});

test('TetrisEngine Bonus: Rewind restores previous grid state and decrements charge', () => {
  const engine = new TetrisEngine();
  // Count filled cells before drop
  const beforeCount = engine.getGrid().flat().filter((c) => c.filled).length;
  assert.equal(beforeCount, 0);

  // Hard drop piece to lock it
  engine.hardDrop();
  const lockedCount = engine.getGrid().flat().filter((c) => c.filled).length;
  assert.ok(lockedCount > 0, 'Grid must have locked blocks');
  assert.equal(engine.canRewind(), true, 'Rewind must now be available');

  // Trigger Rewind
  const success = engine.rewind();
  assert.equal(success, true);
  assert.equal(engine.getBonusState().rewindCharges, 0, 'Rewind charge must be 0 after use');

  // Verify grid is restored to pre-lock state
  const restoredCount = engine.getGrid().flat().filter((c) => c.filled).length;
  assert.equal(restoredCount, 0, 'Grid must be restored to empty state');
  assert.equal(engine.canRewind(), false, 'Cannot rewind again with 0 charges');
});

test('TetrisEngine Bonus: Clearing 20 lines recharges +1 Rewind charge', () => {
  const engine = new TetrisEngine();
  // Drop piece and use the initial charge
  engine.hardDrop();
  engine.rewind();
  assert.equal(engine.getBonusState().rewindCharges, 0, 'Charges should be 0');

  // Simulate clearing 20 lines
  const grid = engine.getGrid();
  for (let r = 0; r < 20; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      grid[r][c] = { filled: true, type: 'I', color: '#006233', patternId: 1 };
    }
  }
  engine.clearFullLines();

  assert.equal(engine.getStats().lines, 20);
  assert.equal(engine.getBonusState().rewindCharges, 1, 'Clearing 20 lines must recharge Rewind to 1');
});

test('TetrisEngine Bonus: Galactic Bomb unlocks at 15 lines, incinerates grid, awards 500 pts, and is single-use', () => {
  const engine = new TetrisEngine();
  assert.equal(engine.canTriggerBomb(), false, 'Bomb must be locked at start');
  assert.equal(engine.triggerBomb(), false, 'Triggering bomb before 15 lines must fail');

  // Fill and clear 15 lines in two batches
  const grid = engine.getGrid();
  // Batch 1: 10 lines
  for (let r = 10; r < 20; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      grid[r][c] = { filled: true, type: 'O', color: '#D4AF37', patternId: 4 };
    }
  }
  engine.clearFullLines();
  assert.equal(engine.canTriggerBomb(), false, 'Still locked at 10 lines');

  // Batch 2: 5 more lines
  const freshGrid = engine.getGrid();
  for (let r = 15; r < 20; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      freshGrid[r][c] = { filled: true, type: 'O', color: '#D4AF37', patternId: 4 };
    }
  }
  engine.clearFullLines();
  assert.equal(engine.getStats().lines, 15);
  assert.equal(engine.canTriggerBomb(), true, 'Bomb must unlock at 15 lines');

  // Put some garbage blocks in the grid to test incineration
  freshGrid[18][2] = { filled: true, type: 'Z', color: '#FF3B30', patternId: 7 };
  freshGrid[19][5] = { filled: true, type: 'S', color: '#00A859', patternId: 6 };

  const initialScore = engine.getStats().score;
  const detonation = engine.triggerBomb();
  assert.equal(detonation, true, 'Detonation must succeed');

  // Grid should be totally empty
  const remainingFilled = engine.getGrid().flat().filter((c) => c.filled).length;
  assert.equal(remainingFilled, 0, 'Galactic Bomb must incinerate all blocks in grid');
  assert.equal(engine.getStats().score, initialScore + 500, 'Bomb must award +500 bonus points');
  assert.equal(engine.getBonusState().bombUsed, true, 'Bomb must be marked as used');
  assert.equal(engine.canTriggerBomb(), false, 'Bomb cannot be triggered a second time');
});

