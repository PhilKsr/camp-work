import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { colors } from '@/lib/brand';
import Providers from './providers';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Camp Work – Campingplätze mit gutem Netz',
  description:
    'Finde Campingplätze in Deutschland mit zuverlässiger Netzabdeckung. Perfekt für digitale Nomaden und Remote Worker.',
  keywords: [
    'Camping',
    'Netzabdeckung',
    'Remote Work',
    'Digitale Nomaden',
    'Deutschland',
    'Campingplätze',
  ],
  authors: [{ name: 'Camp Work' }],
  creator: 'Camp Work',
  publisher: 'Camp Work',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://camp-work.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://camp-work.app',
    title: 'Camp Work – Campingplätze mit gutem Netz',
    description:
      'Finde Campingplätze in Deutschland mit zuverlässiger Netzabdeckung. Perfekt für digitale Nomaden und Remote Worker.',
    siteName: 'Camp Work',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Camp Work - Finde Campingplätze mit gutem Netz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Camp Work – Campingplätze mit gutem Netz',
    description:
      'Finde Campingplätze in Deutschland mit zuverlässiger Netzabdeckung.',
    images: ['/og-image.svg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    title: 'Camp Work',
    statusBarStyle: 'default',
    capable: true,
  },
  other: {
    'msapplication-TileColor': colors.primary.forest,
    'theme-color': colors.primary.forest,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${inter.variable} font-inter bg-[#FEFDF8] text-foreground antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md"
        >
          Zum Hauptinhalt springen
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
