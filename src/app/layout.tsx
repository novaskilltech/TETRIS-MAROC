import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tetris 3D Maroc - Jeu d\'Arcade & Classement Mondial',
  description: 'Jeu de blocs arcade inspiré du Tetris classique avec rendu 3D et esthétique marocaine rouge et verte. Jouez gratuitement sans inscription et grimpez au classement mondial.',
  keywords: ['tetris', 'maroc', 'tetris 3d', 'jeu arcade', 'leaderboard', 'morocco', 'moroccan tetris'],
  authors: [{ name: 'Nova Squad' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
