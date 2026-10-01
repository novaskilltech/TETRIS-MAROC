import crypto from 'crypto';

const SECRET_KEY = process.env.GAME_SESSION_SECRET || 'tetris-maroc-super-secret-arcade-token-2026';

// Blacklist of forbidden / profane terms (basic filter required by CDC)
const PROFANITY_BLACKLIST = [
  'admin',
  'root',
  'system',
  'moderator',
  'hitler',
  'nazi',
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'merde',
  'connard',
  'salope',
  'putain',
  'encule',
];

export interface SessionData {
  sessionId: string;
  timestamp: number;
}

export function generateGameSession(): { sessionId: string; token: string; timestamp: number } {
  const sessionId = crypto.randomUUID();
  const timestamp = Date.now();
  const payload = `${sessionId}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  const token = `${payload}:${hmac}`;

  return { sessionId, token, timestamp };
}

export function verifyGameSession(sessionId: string, token: string): { valid: boolean; durationSeconds: number } {
  if (!sessionId || !token) {
    return { valid: false, durationSeconds: 0 };
  }

  const parts = token.split(':');
  if (parts.length !== 3) {
    return { valid: false, durationSeconds: 0 };
  }

  const [tokSessionId, tokTimestampStr, tokHmac] = parts;
  if (tokSessionId !== sessionId) {
    return { valid: false, durationSeconds: 0 };
  }

  const expectedPayload = `${tokSessionId}:${tokTimestampStr}`;
  const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(expectedPayload).digest('hex');

  // Constant-time comparison
  const hmacBuffer = Buffer.from(tokHmac);
  const expectedBuffer = Buffer.from(expectedHmac);

  if (hmacBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(hmacBuffer, expectedBuffer)) {
    return { valid: false, durationSeconds: 0 };
  }

  const startTimestamp = parseInt(tokTimestampStr, 10);
  const durationSeconds = Math.max(1, Math.floor((Date.now() - startTimestamp) / 1000));

  // Max session validity: 2 hours (nobody plays single Tetris game continuously for 2h in arcade)
  if (durationSeconds > 7200) {
    return { valid: false, durationSeconds };
  }

  return { valid: true, durationSeconds };
}

export function sanitizePseudo(pseudo: string): { valid: boolean; cleanPseudo?: string; reason?: string } {
  if (!pseudo || typeof pseudo !== 'string') {
    return { valid: false, reason: 'Pseudo is required' };
  }

  const clean = pseudo.trim().toUpperCase();

  // Length 3 to 12 characters
  if (clean.length < 3 || clean.length > 12) {
    return { valid: false, reason: 'Length must be between 3 and 12 characters' };
  }

  // Alphanumeric + underscore + hyphen only
  const validRegex = /^[A-Z0-9_-]+$/;
  if (!validRegex.test(clean)) {
    return { valid: false, reason: 'Pseudo must contain only letters, numbers, hyphens or underscores' };
  }

  // Profanity check
  const lower = clean.toLowerCase();
  for (const badWord of PROFANITY_BLACKLIST) {
    if (lower.includes(badWord)) {
      return { valid: false, reason: 'Inappropriate nickname not allowed' };
    }
  }

  return { valid: true, cleanPseudo: clean };
}

export function validateScorePlausibility(
  score: number,
  lines: number,
  level: number,
  durationSeconds: number
): { valid: boolean; reason?: string } {
  if (score < 0 || lines < 0 || level < 1) {
    return { valid: false, reason: 'Negative or invalid numerical values' };
  }

  // Minimum duration check: cannot clear 10 lines in under 3 seconds
  if (lines > 0 && durationSeconds < Math.max(3, lines * 0.4)) {
    return { valid: false, reason: 'Duration too short for the claimed lines' };
  }

  // Max score theoretical limit check
  // Even with 4-line Tetrises at level 15 + hard drops:
  // Theoretical max score per minute is ~15,000 points.
  const minutes = Math.max(0.1, durationSeconds / 60);
  const theoreticalMax = Math.max(5000, minutes * 18000 + lines * 1200);

  if (score > theoreticalMax) {
    return { valid: false, reason: 'Score exceeds physical human limit for this duration' };
  }

  // Ratio check: 0 lines cannot produce more than ~2,000 points (from soft/hard drop alone)
  if (lines === 0 && score > 2500) {
    return { valid: false, reason: 'Excessive score without clearing any lines' };
  }

  return { valid: true };
}
