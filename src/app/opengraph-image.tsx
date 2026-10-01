import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'TÉTRIS 3D MAROC — Arcade Royale & Classement Mondial';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#070A0F',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(193, 39, 45, 0.35) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(0, 98, 51, 0.35) 0%, transparent 45%)',
          border: '14px solid #D4AF37',
          padding: '40px 60px',
          boxSizing: 'border-box',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Top Moroccan Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(15, 23, 34, 0.9)',
            border: '2px solid rgba(212, 175, 55, 0.6)',
            borderRadius: '999px',
            padding: '8px 24px',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '18px', color: '#D4AF37', fontWeight: 'bold', letterSpacing: '4px' }}>
            ★ JEU ARCADE OFFICIEL • ÉDITION 3D ★
          </span>
        </div>

        {/* Main Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            fontSize: '76px',
            fontWeight: 900,
            letterSpacing: '2px',
            lineHeight: 1.1,
            marginBottom: '16px',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: '#E83B43' }}>TÉTRIS</span>
          <span style={{ color: '#D4AF37' }}>3D</span>
          <span style={{ color: '#00A859' }}>MAROC</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#D1D5DB',
            maxWidth: '900px',
            textAlign: 'center',
            marginBottom: '36px',
            lineHeight: 1.3,
          }}
        >
          Gameplay 2D Classique • Rendu 3D WebGL • Compétition & Classement Mondial
        </div>

        {/* Highlights Pills Row */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#C1272D',
              color: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: '16px',
              fontSize: '20px',
              fontWeight: 'bold',
              border: '2px solid #D4AF37',
            }}
          >
            100% GRATUIT & SANS COMPTE
          </div>
          <div
            style={{
              backgroundColor: '#006233',
              color: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: '16px',
              fontSize: '20px',
              fontWeight: 'bold',
              border: '2px solid #D4AF37',
            }}
          >
            MOBILE PORTRAIT & PC
          </div>
          <div
            style={{
              backgroundColor: '#0F1722',
              color: '#D4AF37',
              padding: '12px 24px',
              borderRadius: '16px',
              fontSize: '20px',
              fontWeight: 'bold',
              border: '2px solid #D4AF37',
            }}
          >
            LEADERBOARD MONDIAL
          </div>
        </div>

        {/* Bottom domain badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '2px',
          }}
        >
          tetris-maroc.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
