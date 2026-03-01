import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://misen-ten.vercel.app'),
  title: 'MISEN — Studio IA de Production Cinématographique',
  description:
    'Transformez votre scénario en plan de production complet. 13 moteurs d\'analyse, 7 modèles IA, génération vidéo automatisée. De l\'écriture à l\'écran.',
  keywords: ['MISEN', 'IA', 'cinéma', 'production', 'vidéo', 'scénario', 'storyboard', 'Kling', 'Runway', 'Sora', 'mise en scène', 'intelligence artificielle'],
  authors: [{ name: 'Steve Moradel' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'MISEN — Studio IA de Production Cinématographique',
    description: '13 moteurs d\'analyse × 7 modèles IA. De l\'écriture à l\'écran.',
    url: 'https://misen-ten.vercel.app',
    siteName: 'MISEN',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MISEN — Studio IA de Production',
    description: '13 moteurs d\'analyse × 7 modèles IA. De l\'écriture à l\'écran.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-dark-950 text-slate-50 font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
