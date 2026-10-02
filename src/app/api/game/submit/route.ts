import { NextRequest, NextResponse } from 'next/server';
import { verifyGameSession, sanitizePseudo, validateScorePlausibility } from '@/lib/antiCheat';
import { addLeaderboardScore } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, token, pseudo, score, lines, level } = body;

    // 1. Session verification
    const sessionCheck = verifyGameSession(sessionId, token);
    if (!sessionCheck.valid) {
      return NextResponse.json(
        { success: false, message: 'Session invalide ou expirée.' },
        { status: 403 }
      );
    }

    // 2. Pseudo validation
    const pseudoCheck = sanitizePseudo(pseudo);
    if (!pseudoCheck.valid || !pseudoCheck.cleanPseudo) {
      return NextResponse.json(
        { success: false, message: pseudoCheck.reason || 'Pseudo invalide.' },
        { status: 400 }
      );
    }

    // 3. Plausibility & anti-cheat check
    const numericScore = Number(score) || 0;
    const numericLines = Number(lines) || 0;
    const numericLevel = Number(level) || 1;

    const plausibility = validateScorePlausibility(
      numericScore,
      numericLines,
      numericLevel,
      sessionCheck.durationSeconds
    );

    if (!plausibility.valid) {
      return NextResponse.json(
        { success: false, message: plausibility.reason || 'Score non conforme.' },
        { status: 400 }
      );
    }

    // 4. Record score
    const entry = await addLeaderboardScore({
      pseudo: pseudoCheck.cleanPseudo,
      score: numericScore,
      lines: numericLines,
      level: numericLevel,
    });

    return NextResponse.json({
      success: true,
      entry,
      rank: entry.rank,
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur lors de la soumission.' },
      { status: 500 }
    );
  }
}
