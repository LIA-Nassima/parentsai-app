'use client'

import { useState, useRef } from 'react'
import { ExerciceProbleme } from '@/types'
import { FigureSVG, extractSvg } from '@/components/ui/FigureSVG'
import { supabase } from '@/lib/supabase'

interface Props {
  exercice: ExerciceProbleme
  sessionId: string
  estTermineInitial?: boolean
  photoUrlInitiale?: string | null
  modeParent?: boolean
  estBloque?: boolean
}

// Palette IAla
const ENCRE   = '#1E2A26'
const OR      = '#B8881F'  // doré foncé
const VERT     = '#2E7D6B' // vert de l'app
const VERT_BG  = '#E3F0EC'
const BORDURE  = '#DCE8E4'
const MUTED    = '#6E827B'

export default function ProblemeExercice({ exercice, sessionId, estTermineInitial, photoUrlInitiale, modeParent = false, estBloque = false }: Props) {
  const [estTermine, setEstTermine] = useState(estTermineInitial ?? false)
  const [photoUrl, setPhotoUrl]     = useState<string | null>(photoUrlInitiale ?? null)
  const [uploading, setUploading]   = useState(false)
  const [showCorrection, setShowCorrection] = useState(modeParent)
  const inputRef = useRef<HTMLInputElement>(null)

  const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
    probleme: { bg: '#FDF8EA', color: OR },
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
        setPhotoUrl(json.photo_url as string)
      } else {
        console.error('Erreur upload photo:', json.erreur)
      }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="rounded-2xl border p-6 mb-5" style={{ background: 'white', borderColor: '#EEF0F2', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-lg font-bold" style={{ color: OR }}>
          Exercice {exercice.num}
        </span>
        <span className="text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wider"
          style={{ background: badge.bg, color: badge.color }}>
          {exercice.badge_label}
        </span>
      </div>

      {/* Contexte (SVG éventuel extrait du texte) */}
      {(() => {
        const { texte, svg } = extractSvg(exercice.contexte)
        return (
          <>
            <p className="mb-5" style={{ color: ENCRE, fontSize: '1.0625rem', fontWeight: 500, lineHeight: 1.6 }}>
              {texte}
            </p>
            <FigureSVG svg={exercice.figure || svg} />
          </>
        )
      })()}

      {/* Questions */}
      <div className="space-y-3 mb-5">
        {exercice.questions.map((q, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: '#fff', border: `1.5px solid ${BORDURE}` }}>
            <span className="font-bold" style={{ color: OR, fontSize: '1rem' }}>{q.lettre})</span>
            <span className="ml-2" style={{ color: ENCRE, fontSize: '1rem', fontWeight: 500 }}>{q.enonce}</span>
            {(modeParent || showCorrection) && (
              <div className="mt-2 text-sm pl-4" style={{ borderLeft: `2px solid ${OR}`, color: MUTED }}>
                {q.correction}
              </div>
            )}
          </div>
        ))}
      </div>

      {!modeParent && !estBloque && (
        <>
          {/* Zone photo */}
          <div className="session-no-print rounded-xl p-5 text-center mb-4"
            style={{ border: `2px dashed ${BORDURE}`, background: '#F7F8FA' }}>
            {photoUrl ? (
              <div>
                <img src={photoUrl} alt="Ma réponse" className="max-w-full rounded-lg mx-auto mb-3" style={{ maxHeight: '300px' }} />
                <button onClick={() => inputRef.current?.click()}
                  className="text-sm underline" style={{ color: MUTED }}>
                  Changer la photo
                </button>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-2">📸</div>
                <p className="text-sm mb-3" style={{ color: MUTED }}>
                  Prends en photo ta réponse sur papier
                </p>
                <button onClick={() => inputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: VERT }}>
                  {uploading ? 'Envoi...' : '📷 Prendre une photo'}
                </button>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" capture="environment"
              className="hidden" onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
          </div>

          {/* Checkbox terminé */}
          <label className="session-no-print flex items-center gap-3 p-3.5 rounded-xl cursor-pointer"
            style={{ background: estTermine ? VERT_BG : '#fff', border: `1.5px solid ${estTermine ? VERT : BORDURE}` }}>
            <input type="checkbox" checked={estTermine} onChange={toggleTermine}
              className="w-4 h-4" style={{ accentColor: VERT }} />
            <span className="text-sm font-bold" style={{ color: estTermine ? VERT : ENCRE }}>
              {estTermine ? '✅ Exercice terminé' : 'Marquer comme terminé'}
            </span>
          </label>
        </>
      )}

      {/* Photo visible côté enfant en mode bloqué (déjà soumis) */}
      {!modeParent && estBloque && photoUrl && (
        <div className="mt-4 rounded-xl p-4" style={{ background: '#F7F8FA', border: `1px solid ${BORDURE}` }}>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: MUTED }}>Ta réponse envoyée</p>
          <img src={photoUrl} alt="Ma réponse" className="max-w-full rounded-lg mx-auto" style={{ maxHeight: '300px' }} />
        </div>
      )}

      {/* Correction mode parent */}
      {modeParent && exercice.metacog && (
        <div className="mt-3 p-3 rounded-xl text-sm italic"
          style={{ background: '#eef1f5', color: '#2e3b4e', borderLeft: '3px solid #2e3b4e' }}>
          🤔 {exercice.metacog}
        </div>
      )}

      {/* Photo visible côté parent */}
      {modeParent && photoUrl && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: MUTED }}>Réponse de l'élève</p>
          <img src={photoUrl} alt="Réponse élève" className="max-w-full rounded-lg" style={{ maxHeight: '400px' }} />
        </div>
      )}
    </div>
  )
}
