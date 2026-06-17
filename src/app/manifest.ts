import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IAla',
    short_name: 'IAla',
    description: 'allez, on révise — le prof IA pour vos enfants',
    // Pas de start_url fixe : l'icône réouvre l'URL depuis laquelle elle a été ajoutée
    // (lien personnel de l'enfant avec son jeton), au lieu de forcer "/" → login.
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F7F8FA',
    theme_color: '#2E7D6B',
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
