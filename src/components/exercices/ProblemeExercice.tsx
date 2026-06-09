'use client'

import { useState, useRef } from 'react'
import { ExerciceProbleme } from '@/types'
import { supabase } from '@/lib/supabase'

interface Props {
  exercice: ExerciceProbleme
  sessionId: string
  estTermineInitial?: boolean
  photoUrlInitiale?: string | null
  modeParent?: boolean
  estBloque?: boolean
}

export default function ProblemeExercice({ exercice, sessionId, estTermineInitial, photoUrlInitiale, modeParent = false, estBloque = false }: Props) {
  const [estTermine, setEstTermine] = useState(estTermineInitial ?? false)
  const [photoUrl, setPhotoUrl]     = useState<string | null>(photoUrlInitiale ?? null)
  const [uploading, setUploading]   = useState(false)
  const [showCorrection, setShowCorrection] = useState(modeParent)
  const inputRef = useRef<HTMLInputElement>(null)

  const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
    probleme: { bg: '#fdf1ee', color: 'var(--accent)' },
    dnb:      { bg: '#eef1f5', color: '#2e3b4e' },
  }
  const badge = BADGE_COLORS[exercice.badge_type] || BADGE_COLORS.probleme

  async function toggleTermine() {
    if (modeParent || estBloque) return
    const newVal = !estTermine
    setEstTermine(newVal)
    await supabase.from('reponses').upsert({
      session_id: sessionId,
      exercice_num: exercice.num,
      type: 'probleme',
      est_termine: newVal,
    }, { onConflict: 'session_id,exercice_num' })
  }

  async function uploadPhoto(file: File) {
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      const res = await fetch(`https://mcp.parentsai.eu/photo/${sessionId}/${exercice.num}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_url: dataUrl }),
      })
      const json = await res.json()
      if (json.succes) {
        const url = json.photo_url as string
        setPhotoUrl(url)
        // Persiste l'URL dans Supabase pour que le parent et l'enfant la retrouvent
        await supabase.from('reponses').upsert({
          session_id: sessionId,
          exercice_num: exercice.num,
          type: 'probleme',
          photo_url: url,
        }, { onConflict: 'session_id,exercice_num' })
      }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="rounded-2xl border p-6 mb-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="font-light text-lg" style={{ fontFamily: 'Georgia, serif', color: 'var(--accent)', fontStyle: 'italic' }}>
          Exercice {exercice.num}
        </span>
        <span className="text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wider"
          style={{ background: badge.bg, color: badge.color }}>
          {exercice.badge_label}
        </span>
      </div>

      {/* Contexte */}
      <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--foreground)' }}>
        {exercice.contexte}
      </p>

      {/* Questions */}
      <div className="space-y-3 mb-5">
        {exercice.questions.map((q, i) => (
          <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
            <span className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>{q.lettre})</span>
            <span className="text-sm ml-2">{q.enonce}</span>
            {(modeParent || showCorrection) && (
              <div className="mt-2 text-sm pl-4" style={{ borderLeft: '2px solid var(--accent)', color: 'var(--muted-foreground)' }}>
                {q.correction}
              </div>
            )}
          </div>
        ))}
      </div>

      {!modeParent && !estBloque && (
        <>
          {/* Zone photo */}
          <div className="rounded-xl p-5 text-center mb-4"
            style={{ border: '2px dashed var(--border)', background: 'var(--background)' }}>
            {photoUrl ? (
              <div>
                <img src={photoUrl} alt="Ma réponse" className="max-w-full rounded-lg mx-auto mb-3" style={{ maxHeight: '300px' }} />
                <button onClick={() => inputRef.current?.click()}
                  className="text-sm underline" style={{ color: 'var(--muted-foreground)' }}>
                  Changer la photo
                </button>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-2">📸</div>
                <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                  Prends en photo ta réponse sur papier
                </p>
                <button onClick={() => inputRef.current?.click()}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ background: 'var(--accent)' }}>
                  {uploading ? 'Envoi...' : '📷 Prendre une photo'}
                </button>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" capture="environment"
              className="hidden" onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
          </div>

          {/* Checkbox terminé */}
          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
            style={{ background: estTermine ? '#edf7f1' : 'var(--background)', border: '1px solid var(--border)' }}>
            <input type="checkbox" checked={estTermine} onChange={toggleTermine}
              className="w-4 h-4 accent-green-600" />
            <span className="text-sm font-medium" style={{ color: estTermine ? '#2d7a4f' : 'var(--foreground)' }}>
              {estTermine ? '✅ Exercice terminé' : 'Marquer comme terminé'}
            </span>
          </label>
        </>
      )}

      {/* Photo visible côté enfant en mode bloqué (déjà soumis) */}
      {!modeParent && estBloque && photoUrl && (
        <div className="mt-4 rounded-xl p-4" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>Ta réponse envoyée</p>
          <img src={photoUrl} alt="Ma réponse" className="max-w-full rounded-lg mx-auto" style={{ maxHeight: '300px' }} />
        </div>
      )}

      {/* Correction mode parent */}
      {modeParent && exercice.metacog && (
        <div className="mt-3 p-3 rounded-lg text-sm italic"
          style={{ background: '#eef1f5', color: '#2e3b4e', borderLeft: '3px solid #2e3b4e' }}>
          🤔 {exercice.metacog}
        </div>
      )}

      {/* Photo visible côté parent */}
      {modeParent && photoUrl && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>Réponse de l'élève</p>
          <img src={photoUrl} alt="Réponse élève" className="max-w-full rounded-lg" style={{ maxHeight: '400px' }} />
        </div>
      )}
    </div>
  )
}
