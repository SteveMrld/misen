/** @type {import('next').NextConfig} */
// Build: 2026-02-28 — force clean Vercel deploy
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Ensure static assets are properly cached
  generateBuildId: async () => {
    return 'v7-build-' + Date.now()
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
// V14.0 Landing Light Premium — Tue Mar  3 09:13:10 UTC 2026
// V14.0 rebuild 1772529528
