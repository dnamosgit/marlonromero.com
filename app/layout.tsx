import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { SITE } from '@/lib/data';
import './globals.css';

// Fonts are downloaded at build time and served from the site itself: no third-party request, no layout shift.
const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const sans = Inter({ subsets: ['latin'], weight: ['300', '400'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Marlon Romero — The Worlds Within', template: '%s — Marlon Romero' },
  description: 'An immersive exhibition of paintings by Marlon Romero, Peruvian painter and visionary environmental artist from Pucallpa, near the Amazon rainforest.',
  openGraph: { type: 'website', siteName: 'Marlon Romero', title: 'Marlon Romero — The Worlds Within' },
};
export const viewport: Viewport = { themeColor: '#f3efe7', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
