/**
 * Normalise un prénom : trim + Title case en respectant les tirets.
 * "assia" → "Assia"
 * "ASSIA" → "Assia"
 * "jean-pierre" → "Jean-Pierre"
 * "  marie  " → "Marie"
 *
 * Équivalent frontend de normaliser_prenom() côté serveur Python.
 */
export function normaliserPrenom(prenom: string): string {
  if (!prenom) return ''
  return prenom
    .trim()
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-')
}
