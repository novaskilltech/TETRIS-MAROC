import { NextResponse } from 'next/server';
import { generateGameSession } from '@/lib/antiCheat';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = generateGameSession();
    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      token: session.token,
      timestamp: session.timestamp,
    });
  } catch (error) {
    console.error('Failed to create game session:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
