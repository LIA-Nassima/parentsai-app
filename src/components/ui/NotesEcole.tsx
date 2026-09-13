'use client'

import { NoteEcole } from '@/types'

// Couleur de la note selon le ratio (rouge < 50 %, orange < 75 %, vert sinon)
function couleurNote(n?: number, sur?: number): string {
  if (n == null || !sur) return '#1E2A26'
  const r = n / sur
  if (r < 0.5) return '#A32D2D'
  if (r < 0.75) return '#854F0B'
  return '#1F5A4D'
}

// Section « Notes prof » : les vrais contrôles du professeur + notions à revoir.
// Même rendu côté parent et côté enfant (le message motivant est ajouté par la page).
export function SectionNotesEcole({ notes }: { notes: NoteEcole[] }) {
  if (notes.length === 0) {
    return (
      <div className="rounded-2xl p-4 text-center" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <p className="text-sm" style={{ color: '#6E827B' }}>Aucune note du prof pour l'instant.</p>
        <p className="text-xs mt-1" style={{ color: '#9aa8a2' }}>
          Montre un contrôle corrigé à Claude : « Enregistre ce DS noté ».
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {notes.map(n => {
        const c = couleurNote(n.note, n.note_sur)
        const dateSrc = n.date_controle || n.created_at
        const date = dateSrc
          ? new Date(dateSrc).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
          : ''
        return (
          <div
            key={n.id}
            className="rounded-2xl p-4"
            style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `3px solid ${c}` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-sm font-bold" style={{ color: '#1E2A26' }}>{n.matiere}</span>
                {n.chapitre && <span className="text-xs" style={{ color: '#6E827B' }}> · {n.chapitre}</span>}
                {date && <span className="text-xs" style={{ color: '#9aa8a2' }}> · {date}</span>}
              </div>
              {n.note != null && (
                <span className="text-base font-extrabold shrink-0" style={{ color: c }}>
                  {n.note}/{n.note_sur || 20}
                </span>
              )}
            </div>

            {(n.notions_a_revoir?.length ?? 0) > 0 && (
              <>
                <p className="text-xs mt-2.5 uppercase tracking-wide" style={{ color: '#6E827B', fontSize: 10 }}>À revoir</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {n.notions_a_revoir!.map((x, i) => (
                    <span key={i} className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: '#FAEEDA', color: '#854F0B' }}>
                      {x}
                    </span>
                  ))}
                </div>
              </>
            )}

            {n.commentaire && (
              <p className="text-xs mt-2.5 italic leading-relaxed" style={{ color: '#5F5E5A' }}>« {n.commentaire} »</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
