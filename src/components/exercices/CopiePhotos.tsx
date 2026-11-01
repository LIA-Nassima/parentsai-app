'use client'

import { useState, useRef, useEffect } from 'react'

// Palette IAla
const VERT    = '#2E7D6B'
const BORDURE = '#DCE8E4'
const MUTED   = '#6E827B'
const ENCRE   = '#1E2A26'

export interface PhotoCopie {
  exercice_num: number   // numéro interne (≥ 1001) servant aussi de "page"
  photo_url: string
}

interface Props {
  sessionId: string
  photosInitiales: PhotoCopie[]
  /** Prévient la page quand un envoi est en cours (pour bloquer « Valider »). */
  onUploadingChange?: (enCours: boolean) => void
  /** Remonte la liste courante des photos (pour l'avertissement « aucune photo »). */
  onPhotosChange?: (photos: PhotoCopie[]) => void
}

function lireDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function CopiePhotos({ sessionId, photosInitiales, onUploadingChange, onPhotosChange }: Props) {
  const [photos, setPhotos]       = useState<PhotoCopie[]>(photosInitiales)
  const [enCours, setEnCours]     = useState(0)       // nombre d'envois en cours
  const [erreur, setErreur]       = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Remonte l'état d'envoi à la page (pour désactiver « Valider » tant que ça charge).
  useEffect(() => { onUploadingChange?.(enCours > 0) }, [enCours, onUploadingChange])
  // Remonte la liste courante des photos (au montage + à chaque ajout/suppression).
  useEffect(() => { onPhotosChange?.(photos) }, [photos, onPhotosChange])

  // Upload SÉQUENTIEL : évite les collisions de numéro de page et donne un suivi clair.
  async function ajouter(files: FileList | null) {
    if (!files) return
    setErreur(null)
    for (const file of Array.from(files)) {
      setEnCours(n => n + 1)
      try {
        const dataUrl = await lireDataUrl(file)
        const res = await fetch(`https://mcp.parentsai.eu/copie/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data_url: dataUrl }),
        })
        const json = await res.json()
        if (json.succes) {
          setPhotos(p => [...p, { exercice_num: json.exercice_num, photo_url: json.photo_url }])
        } else {
          setErreur("Une photo n'a pas pu être envoyée. Réessaie.")
        }
      } catch {
        setErreur("Envoi impossible — vérifie ta connexion et réessaie.")
      } finally {
        setEnCours(n => n - 1)
      }
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  async function supprimer(num: number) {
    const avant = photos
    setPhotos(p => p.filter(x => x.exercice_num !== num))   // optimiste
    try {
      const res = await fetch(`https://mcp.parentsai.eu/copie/${sessionId}/${num}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.succes) setPhotos(avant)                    // échec → on remet
    } catch {
      setPhotos(avant)
    }
  }

  return (
    <div
      className="session-no-print rounded-2xl p-5 mb-5"
      style={{ background: '#F7F8FA', border: `2px dashed ${BORDURE}` }}
    >
      <p className="text-sm font-bold mb-1" style={{ color: ENCRE }}>📸 Ta copie</p>
      <p className="text-xs mb-4" style={{ color: MUTED }}>
        Prends en photo ta feuille (tu peux ajouter plusieurs pages). Attends que chaque photo
        soit envoyée <b>avant</b> de valider.
      </p>

      {/* Galerie des photos ajoutées */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {photos.map((ph, i) => (
            <div key={ph.exercice_num} className="relative">
              <img
                src={ph.photo_url}
                alt={`Page ${i + 1}`}
                className="w-full rounded-lg object-cover"
                style={{ aspectRatio: '3/4', border: `1px solid ${BORDURE}` }}
              />
              <span
                className="absolute bottom-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
              >
                Page {i + 1}
              </span>
              <button
                onClick={() => supprimer(ph.exercice_num)}
                className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold shadow"
                style={{ background: '#FBE6E3', color: '#A32D2D' }}
                aria-label="Supprimer la photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* État d'envoi */}
      {enCours > 0 && (
        <p className="text-xs font-semibold mb-3" style={{ color: '#B8881F' }}>
          ⏳ Envoi en cours… ({enCours}) — ne valide pas encore.
        </p>
      )}
      {erreur && (
        <p className="text-xs font-semibold mb-3" style={{ color: '#A32D2D' }}>{erreur}</p>
      )}

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: VERT }}
      >
        {photos.length > 0 ? '📷 Ajouter une autre photo' : '📷 Prendre une photo'}
      </button>
      <input
        ref={inputRef} type="file" accept="image/*" capture="environment" multiple
        className="hidden" onChange={e => ajouter(e.target.files)}
      />
    </div>
  )
}
