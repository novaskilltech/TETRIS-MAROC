import fs from 'fs';
import path from 'path';
import type { LeaderboardEntry } from '../types/game.ts';

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

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return {
    url,
    key: serviceKey || anonKey,
    hasConfig: Boolean(url && (serviceKey || anonKey)),
  };
}

// Load leaderboard from disk if available (Fallback)
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

export async function getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  const { url, key, hasConfig } = getSupabaseConfig();

  if (hasConfig && url && key) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `${url}/rest/v1/tetris_leaderboard?select=id,pseudo,score,lines,level,created_at&order=score.desc,created_at.asc&limit=${limit}`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          signal: controller.signal,
          cache: 'no-store',
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const rows = (await res.json()) as Array<{
          id: string;
          pseudo: string;
          score: number;
          lines: number;
          level: number;
          created_at: string;
        }>;

        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map((r, index) => ({
            id: r.id,
            pseudo: r.pseudo,
            score: r.score,
            lines: r.lines,
            level: r.level,
            createdAt: r.created_at,
            rank: index + 1,
          }));
        }
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local memory cache:', err);
    }
  }

  // Fallback to local memory / file
  const all = loadLeaderboard();
  const sorted = [...all].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return sorted.slice(0, limit).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export async function addLeaderboardScore(
  entry: Omit<LeaderboardEntry, 'id' | 'rank' | 'createdAt'>
): Promise<LeaderboardEntry> {
  const { url, key, hasConfig } = getSupabaseConfig();

  if (hasConfig && url && key) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // 1. Insert row in Supabase
      const postRes = await fetch(`${url}/rest/v1/tetris_leaderboard`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify([
          {
            pseudo: entry.pseudo,
            score: entry.score,
            lines: entry.lines,
            level: entry.level,
          },
        ]),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (postRes.ok) {
        const createdRows = (await postRes.json()) as Array<{
          id: string;
          pseudo: string;
          score: number;
          lines: number;
          level: number;
          created_at: string;
        }>;

        if (Array.isArray(createdRows) && createdRows.length > 0) {
          const created = createdRows[0];

          // 2. Calculate real rank via count query
          let rank: number | undefined = undefined;
          try {
            const countRes = await fetch(
              `${url}/rest/v1/tetris_leaderboard?score=gt.${entry.score}`,
              {
                headers: {
                  apikey: key,
                  Authorization: `Bearer ${key}`,
                  Prefer: 'count=exact',
                  'Range-Unit': 'items',
                  Range: '0-0',
                },
              }
            );
            if (countRes.ok) {
              const contentRange = countRes.headers.get('content-range');
              const totalBetter = contentRange
                ? parseInt(contentRange.split('/')[1] || '0', 10)
                : 0;
              rank = totalBetter + 1;
            }
          } catch {
            // Rank calculation fallback
          }

          return {
            id: created.id,
            pseudo: created.pseudo,
            score: created.score,
            lines: created.lines,
            level: created.level,
            createdAt: created.created_at,
            rank,
          };
        }
      }
    } catch (err) {
      console.warn('Supabase insert failed, falling back to local storage:', err);
    }
  }

  // Fallback to local memory / file
  const all = loadLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  all.push(newEntry);
  all.sort((a, b) => b.score - a.score);

  const top100 = all.slice(0, 100);
  saveLeaderboard(top100);

  const rank = top100.findIndex((e) => e.id === newEntry.id) + 1;
  return { ...newEntry, rank: rank > 0 ? rank : undefined };
}
