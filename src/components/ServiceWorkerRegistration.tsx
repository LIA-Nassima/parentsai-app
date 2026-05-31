'use client'

import { useEffect } from 'react'

// Composant client invisible — enregistre le service worker PWA au chargement
// Doit être dans layout.tsx pour être présent sur toutes les pages
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker enregistré :', registration.scope)
        })
        .catch((err) => {
          console.error('[PWA] Échec enregistrement SW :', err)
        })
    }
  }, [])

  // Composant invisible — ne rend rien dans le DOM
  return null
}
