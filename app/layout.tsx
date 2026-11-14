import type { Metadata, Viewport } from 'next';
import { SITE } from '@/lib/data';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Marlon Romero Gomez — The Worlds Within', template: '%s — Marlon Romero Gomez' },
  description: 'An immersive exhibition of paintings by Marlon Romero Gomez, Peruvian painter and visionary environmental artist from Pucallpa, near the Amazon rainforest.',
  openGraph: { type: 'website', siteName: 'Marlon Romero Gomez', title: 'Marlon Romero Gomez — The Worlds Within' },
};
export const viewport: Viewport = { themeColor: '#050806', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
