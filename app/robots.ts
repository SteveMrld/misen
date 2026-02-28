import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/project/', '/settings/'],
      },
    ],
    sitemap: 'https://misen-ten.vercel.app/sitemap.xml',
  }
}
