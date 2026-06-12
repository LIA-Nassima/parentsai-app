'use client'

import { useState } from 'react'
import { ExerciceQCM } from '@/types'
import { supabase } from '@/lib/supabase'

interface Props {
  exercice: ExerciceQCM
  sessionId: string
  reponseInitiale?: number | null
  modeParent?: boolean
  estBloque?: boolean
  onReponse?: (exerciceNum: number, estCorrect: boolean) => void
}

const LETTRES = ['A', 'B', 'C', 'D', 'E']

// Palette IAla
const ENCRE    = '#1E2A26'  // texte principal foncé
const OR       = '#B8881F'  // doré foncé (titres / correction)
const VERT      = '#2E7D6B' // vert de l'app (bonne réponse)
const VERT_BG   = '#E3F0EC'
const ROUGE     = '#D9483B' // rouge (faux)
const ROUGE_BG  = '#FBE6E3'
const BORDURE   = '#DCE8E4'

export default function QCMExercice({ exercice, sessionId, reponseInitiale, modeParent = false, estBloque = false, onReponse }: Props) {
  const [reponseChoisie, setReponseChoisie] = useState<number | null>(reponseInitiale ?? null)
  const [revealed, setRevealed] = useState(reponseInitiale !== null && reponseInitiale !== undefined)

  const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
    automatisme: { bg: '#eef1f5', color: '#2e3b4e' },
    qcm:         { bg: '#edf7f1', color: '#2d7a4f' },
    dnb:         { bg: '#eef1f5', color: '#2e3b4e' },
  }
  const badge = BADGE_COLORS[exercice.badge_type] || BADGE_COLORS.qcm

  async function choisir(idx: number) {
    if (revealed || modeParent || estBloque) return
    setReponseChoisie(idx)
    setRevealed(true)
    const estCorrect = idx === exercice.correct
    await supabase.from('reponses').upsert({
      session_id: sessionId,
      exercice_num: exercice.num,
      type: 'qcm',
      reponse_index: idx,
      est_correct: estCorrect,
      est_termine: true,
    }, { onConflict: 'session_id,exercice_num' })
    onReponse?.(exercice.num, estCorrect)
  }

  const isCorrect = reponseChoisie === exercice.correct

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

      {/* Énoncé */}
      <p className="mb-5" style={{ color: ENCRE, fontSize: '1.0625rem', fontWeight: 500, lineHeight: 1.6 }}>
        {exercice.enonce}
      </p>

      {/* Choix */}
      <div className="space-y-2.5">
        {exercice.reponses.map((rep, idx) => {
          let style: React.CSSProperties = {
            width: '100%', textAlign: 'left', padding: '14px 16px',
            border: `1.5px solid ${BORDURE}`, borderRadius: '10px',
            background: '#fff', cursor: revealed || modeParent ? 'default' : 'pointer',
            fontFamily: 'inherit', fontSize: '1rem', color: ENCRE, transition: 'all 0.15s',
            display: 'block',
          }

          if (revealed || modeParent) {
            if (idx === exercice.correct) {
              style = { ...style, background: VERT_BG, borderColor: VERT, color: VERT, fontWeight: 700 }
            } else if (idx === reponseChoisie && idx !== exercice.correct) {
              style = { ...style, background: ROUGE_BG, borderColor: ROUGE, color: ROUGE, textDecoration: 'line-through' }
            }
          }

          return (
            <button key={idx} style={style} onClick={() => choisir(idx)}>
              <span style={{ fontWeight: 700, marginRight: '10px' }}>{LETTRES[idx]})</span>
              {rep}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {revealed && (
        <div className="mt-4 p-3.5 rounded-xl text-sm font-bold flex items-center gap-2"
          style={{ background: isCorrect ? VERT_BG : ROUGE_BG, color: isCorrect ? VERT : ROUGE }}>
          {isCorrect ? '✓ Bonne réponse !' : '✗ Faux !'}
        </div>
      )}

      {/* Correction */}
      {(revealed || modeParent) && (
        <div className="mt-4 p-4 rounded-r-xl text-sm leading-relaxed"
          style={{ borderLeft: `3px solid ${OR}`, background: '#FDF8EA', color: ENCRE }}>
          <strong style={{ color: OR }}>Correction : </strong>
          {exercice.correction}
          {exercice.piege && (
            <p className="mt-2 italic" style={{ color: '#6E827B' }}>
              💡 {exercice.piege}
            </p>
          )}
        </div>
      )}

      {/* Métacognition */}
      {(revealed || modeParent) && exercice.metacog && (
        <div className="mt-3 p-3 rounded-xl text-sm italic"
          style={{ background: '#eef1f5', color: '#2e3b4e', borderLeft: '3px solid #2e3b4e' }}>
          🤔 {exercice.metacog}
        </div>
      )}
    </div>
  )
}
