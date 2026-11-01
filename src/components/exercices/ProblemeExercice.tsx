'use client'

import { ExerciceProbleme } from '@/types'
import { FigureSVG, extractSvg } from '@/components/ui/FigureSVG'
import { TexteMath } from '@/components/ui/TexteMath'

interface Props {
  exercice: ExerciceProbleme
  /** true = afficher le corrigé-type (parent, ou enfant après validation). */
  modeParent?: boolean
  /** Photo rattachée à l'exercice (ancien modèle « une photo par exercice »). */
  photoUrlInitiale?: string | null
}

// Palette IAla
const ENCRE   = '#1E2A26'
const OR      = '#B8881F'
const BORDURE = '#DCE8E4'
const MUTED   = '#6E827B'

// Les copies sont désormais photographiées globalement en bas du devoir (voir CopiePhotos).
// Cet exercice n'affiche donc que l'énoncé + le corrigé-type ; la photo n'apparaît que
// pour les anciennes sessions qui avaient une photo par exercice.
export default function ProblemeExercice({ exercice, modeParent = false, photoUrlInitiale }: Props) {
  const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
    probleme: { bg: '#FDF8EA', color: OR },
    dnb:      { bg: '#eef1f5', color: '#2e3b4e' },
  }
  const badge = BADGE_COLORS[exercice.badge_type] || BADGE_COLORS.probleme

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
            <p className="mb-5" style={{ color: ENCRE, fontSize: '1.0625rem', fontWeight: 500, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              <TexteMath>{texte}</TexteMath>
            </p>
            <FigureSVG svg={exercice.figure || svg} />
          </>
        )
      })()}

      {/* Questions */}
      <div className="space-y-3 mb-2">
        {exercice.questions.map((q, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: '#fff', border: `1.5px solid ${BORDURE}` }}>
            <span className="font-bold" style={{ color: OR, fontSize: '1rem' }}>{q.lettre})</span>
            <span className="ml-2" style={{ color: ENCRE, fontSize: '1rem', fontWeight: 500 }}><TexteMath>{q.enonce}</TexteMath></span>
            {modeParent && (
              <div className="mt-2 text-sm pl-4" style={{ borderLeft: `2px solid ${OR}`, color: MUTED, whiteSpace: 'pre-line' }}>
                <TexteMath>{q.correction}</TexteMath>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Réflexion métacognitive (mode corrigé) */}
      {modeParent && exercice.metacog && (
        <div className="mt-3 p-3 rounded-xl text-sm italic"
          style={{ background: '#eef1f5', color: '#2e3b4e', borderLeft: '3px solid #2e3b4e' }}>
          🤔 <TexteMath>{exercice.metacog}</TexteMath>
        </div>
      )}

      {/* Ancien modèle : photo rattachée à cet exercice (sessions d'avant la copie globale) */}
      {photoUrlInitiale && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: MUTED }}>
            {modeParent ? "Réponse de l'élève" : 'Ta réponse'}
          </p>
          <img src={photoUrlInitiale} alt="Réponse" className="max-w-full rounded-lg" style={{ maxHeight: '400px' }} />
        </div>
      )}
    </div>
  )
}
