import fs from 'fs';
import path from 'path';
import { LeaderboardEntry } from '../types/game';

const DATA_FILE = path.join(process.cwd(), 'data', 'leaderboard.json');

// Initial seed records reflecting Moroccan arcade leaderboard
const INITIAL_SCORES: LeaderboardEntry[] = [
  { id: '1', pseudo: 'ATLAS_KING', score: 98500, lines: 112, level: 12, createdAt: '2026-09-28T14:20:00Z' },
  { id: '2', pseudo: 'MAROC_PRO', score: 84200, lines: 98, level: 10, createdAt: '2026-09-29T18:45:00Z' },
  { id: '3', pseudo: 'CASA_BLANCA', score: 71000, lines: 84, level: 9, createdAt: '2026-09-30T10:15:00Z' },
  { id: '4', pseudo: 'TETRIS_CHAMP', score: 58900, lines: 72, level: 8, createdAt: '2026-09-30T21:00:00Z' },
  { id: '5', pseudo: 'RABAT_NOVA', score: 49300, lines: 61, level: 7, createdAt: '2026-10-01T08:30:00Z' },
  { id: '6', pseudo: 'SAHARA_VIP', score: 38200, lines: 49, level: 5, createdAt: '2026-10-01T12:00:00Z' },
  { id: '7', pseudo: 'FES_LEGEND', score: 29500, lines: 38, level: 4, createdAt: '2026-10-01T15:10:00Z' },
  { id: '8', pseudo: 'TANGIER_ACE', score: 21400, lines: 28, level: 3, createdAt: '2026-10-01T16:40:00Z' },
  { id: '9', pseudo: 'OUJDA_HERO', score: 15800, lines: 20, level: 3, createdAt: '2026-10-01T17:15:00Z' },
  { id: '10', pseudo: 'AGADIR_77', score: 10200, lines: 14, level: 2, createdAt: '2026-10-01T17:50:00Z' },
];

let inMemoryLeaderboard: LeaderboardEntry[] = [...INITIAL_SCORES];

// Load leaderboard from disk if available
function loadLeaderboard(): LeaderboardEntry[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryLeaderboard = parsed;
        return inMemoryLeaderboard;
      }
    }
  } catch (err) {
    console.warn('Could not read leaderboard from disk, using memory state:', err);
  }
  return inMemoryLeaderboard;
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
  inMemoryLeaderboard = entries;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write leaderboard to disk (serverless ephemeral storage):', err);
  }
}

export function getLeaderboard(limit = 100): LeaderboardEntry[] {
  const all = loadLeaderboard();
  // Sort descending by score, tie-break by earliest date
  const sorted = [...all].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return sorted.slice(0, limit).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export function addLeaderboardScore(entry: Omit<LeaderboardEntry, 'id' | 'rank' | 'createdAt'>): LeaderboardEntry {
  const all = loadLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  all.push(newEntry);
  all.sort((a, b) => b.score - a.score);

  // Keep top 100
  const top100 = all.slice(0, 100);
  saveLeaderboard(top100);

  const rank = top100.findIndex((e) => e.id === newEntry.id) + 1;
  return { ...newEntry, rank: rank > 0 ? rank : undefined };
}
