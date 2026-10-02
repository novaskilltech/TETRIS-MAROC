import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leaderboard = await getLeaderboard(100);
    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, message: 'Impossible de récupérer le classement.' },
      { status: 500 }
    );
  }
}
