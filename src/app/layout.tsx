import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://tetris-maroc.vercel.app'),
  title: 'TÉTRIS 3D MAROC — Jeu d\'Arcade & Classement Mondial',
  description:
    'Jeu de blocs arcade inspiré du Tetris classique avec rendu 3D WebGL et esthétique marocaine rouge et verte. Jouez gratuitement sans inscription et grimpez au classement mondial.',
  keywords: [
    'tetris',
    'maroc',
    'tetris 3d',
    'tetris maroc',
    'jeu arcade marocain',
    'morocco tetris',
    'classement mondial tetris',
    'webgl tetris',
  ],
  authors: [{ name: 'Nova Squad', url: 'https://github.com/novaskilltech' }],
  creator: 'Nova Squad',
  publisher: 'Nova Squad',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', sizes: '32x32' },
      { url: '/icon.svg', sizes: '16x16' },
    ],
    apple: [
      { url: '/icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
  },
  openGraph: {
    title: 'TÉTRIS 3D MAROC — Jeu d\'Arcade & Classement Mondial',
    description:
      'Jeu de blocs arcade inspiré du Tetris classique avec rendu 3D WebGL et esthétique marocaine rouge et verte. Jouez gratuitement sans inscription et comparez vos scores.',
    url: 'https://tetris-maroc.vercel.app',
    siteName: 'TÉTRIS 3D MAROC',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TÉTRIS 3D MAROC — Jeu d\'Arcade & Classement Mondial',
    description:
      'Jeu de blocs arcade inspiré du Tetris classique avec rendu 3D WebGL et esthétique marocaine rouge et verte. Jouez gratuitement sans inscription !',
    creator: '@novaskilltech',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#C1272D',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen antialiased morocco-pattern-bg">{children}</body>
    </html>
  );
}
