// Service Worker minimal — ParentsAI PWA
// Stratégie : network-first (pas de cache offline pour l'instant)
// Ce fichier est requis pour que l'app soit "installable" sur mobile

self.addEventListener('install', () => {
  // Activation immédiate, sans attendre la fermeture des anciens onglets
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Prise en main immédiate de tous les onglets ouverts
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Pour l'instant, on laisse passer toutes les requêtes normalement
  // (le mode offline avec cache pourra être ajouté plus tard)
  event.respondWith(fetch(event.request))
})
