'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { SessionAvecStats } from '@/types'

// Vue « Rechercher » (archive) : filtre toutes les sessions par texte (chapitre),
// matière et type, quel que soit le moment où elles ont été créées.
// Le rendu d'une ligne est délégué à `renderLigne` (différent enfant / parent).

type TypeFiltre = 'tout' | 'session' | 'evaluation' | 'fiche'

const TYPES: { id: TypeFiltre; label: string }[] = [
  { id: 'tout',       label: 'Tout' },
  { id: 'session',    label: 'Sessions' },
  { id: 'evaluation', label: 'DS/Brevet' },
  { id: 'fiche',      label: 'Fiches' },
]

function typeDe(s: SessionAvecStats): TypeFiltre {
  const t = s.type_evaluation
  if (t === 'fiche') return 'fiche'
  if (t === 'ds' || t === 'brevet_blanc') return 'evaluation'
  return 'session'
}

function Chip({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
      style={actif
        ? { background: '#2E7D6B', color: '#fff' }
        : { background: '#fff', color: '#6E827B', border: '1px solid #DCE8E4' }}
    >
      {children}
    </button>
  )
}

export function RechercheSessions({
  sessions, renderLigne, couleurs, icones,
}: {
  sessions: SessionAvecStats[]
  renderLigne: (s: SessionAvecStats) => React.ReactNode
  couleurs: Record<string, string>
  icones: Record<string, string>
}) {
  const [q, setQ]             = useState('')
  const [matiere, setMatiere] = useState<string | null>(null)
  const [type, setType]       = useState<TypeFiltre>('tout')

  const matieresPresentes = Array.from(new Set(sessions.map(s => s.matiere))).sort()

  const resultats = sessions.filter(s => {
    if (matiere && s.matiere !== matiere) return false
    if (type !== 'tout' && typeDe(s) !== type) return false
    const needle = q.trim().toLowerCase()
    if (needle && !`${s.chapitre} ${s.matiere}`.toLowerCase().includes(needle)) return false
    return true
  })

  const parMatiere: Record<string, SessionAvecStats[]> = {}
  for (const s of resultats) (parMatiere[s.matiere] ??= []).push(s)
  for (const k in parMatiere) parMatiere[k].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))

  return (
    <div>
      {/* Barre de recherche */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3" style={{ background: '#fff', border: '1px solid #DCE8E4' }}>
        <Search size={16} style={{ color: '#6E827B' }} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Rechercher un chapitre…"
          className="flex-1 text-sm outline-none"
          style={{ background: 'transparent', color: '#1E2A26' }}
        />
        {q && <button onClick={() => setQ('')} className="text-sm" style={{ color: '#9aa8a2' }} aria-label="Effacer">✕</button>}
      </div>

      {/* Filtres matière */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2" style={{ scrollbarWidth: 'none' }}>
        <Chip actif={matiere === null} onClick={() => setMatiere(null)}>Toutes</Chip>
        {matieresPresentes.map(m => (
          <Chip key={m} actif={matiere === m} onClick={() => setMatiere(matiere === m ? null : m)}>
            {icones[m] || '📚'} {m}
          </Chip>
        ))}
      </div>

      {/* Filtres type */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {TYPES.map(t => (
          <Chip key={t.id} actif={type === t.id} onClick={() => setType(t.id)}>{t.label}</Chip>
        ))}
      </div>

      {/* Résultats */}
      {resultats.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm" style={{ color: '#6E827B' }}>Aucun résultat.</p>
          <p className="text-xs mt-1" style={{ color: '#9aa8a2' }}>Essaie un autre mot ou enlève un filtre.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(parMatiere).map(([m, liste]) => (
            <div key={m} className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid #F0F1F3' }}>
                <div className="w-1 h-5 rounded-full shrink-0" style={{ background: couleurs[m] || '#2E7D6B' }} />
                <span className="font-bold text-xs uppercase tracking-wide" style={{ color: '#1E2A26' }}>{icones[m] || '📚'} {m}</span>
                <span className="text-xs ml-auto" style={{ color: '#9aa8a2' }}>{liste.length}</span>
              </div>
              <div className="px-4">
                {liste.map(s => <div key={s.id}>{renderLigne(s)}</div>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
