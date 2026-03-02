import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MISEN — Studio IA de Production Cinématographique',
    short_name: 'MISEN',
    description: '13 moteurs d\'analyse × 7 modèles IA. De l\'écriture à l\'écran.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06080D',
    theme_color: '#C07B2A',
    icons: [
      {
        src: '/favicon.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
