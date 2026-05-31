import type { MetadataRoute } from 'next'

// Manifest PWA — Next.js le sert automatiquement à /manifest.webmanifest
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ParentsAI',
    short_name: 'ParentsAI',
    description: 'Le professeur particulier IA pour vos enfants',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8f4ef',
    theme_color: '#2e3b4e',
    icons: [
      {
        src: '/icons/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
