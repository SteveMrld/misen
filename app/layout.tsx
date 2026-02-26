import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MISEN — Studio IA de Production Cinématographique',
  description:
    'Transformez votre scénario en plan de production complet avec assignation de modèles IA, génération de prompts optimisés, et suivi de cohérence visuelle.',
  keywords: ['MISEN', 'IA', 'cinéma', 'production', 'vidéo', 'scénario', 'storyboard'],
  authors: [{ name: 'Steve Moradel' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-dark-950 text-slate-50 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
