'use client'

import { ReactNode, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { SessionAvecStats } from '@/types'

export function est3eme(classe: string): boolean {
  return classe.trim().toLowerCase().startsWith('3')
}

// Sous-catégories par type d'évaluation
export const SOUS_CATEGORIES: {
  id: string
  label: string
  emoji: string
  match: (s: SessionAvecStats) => boolean
  seulement3eme?: boolean
}[] = [
  { id: 'exo', label: 'Exercices',        emoji: '📚', match: s => s.type_evaluation !== 'ds' && s.type_evaluation !== 'brevet_blanc' },
  { id: 'ds',  label: 'Devoir surveillé', emoji: '📝', match: s => s.type_evaluation === 'ds' },
  { id: 'bb',  label: 'Brevet Blanc',     emoji: '🏆', match: s => s.type_evaluation === 'brevet_blanc', seulement3eme: true },
]

// Découpe une liste de sessions en groupes non vides (Exercices / DS / Brevet Blanc)
export function grouperParType(sessions: SessionAvecStats[], classe: string) {
  return SOUS_CATEGORIES
    .filter(cat => !(cat.seulement3eme && !est3eme(classe)))
    .map(cat => ({ cat, items: sessions.filter(cat.match) }))
    .filter(g => g.items.length > 0)
}

// Gère l'état ouvert/fermé de plusieurs sous-catégories (clé = `${matiere}::${catId}`)
export function useSousOuvertes(initial?: string[]) {
  const [ouvertes, setOuvertes] = useState<Set<string>>(new Set(initial ?? []))
  return {
    estOuverte: (cle: string) => ouvertes.has(cle),
    basculer: (cle: string) =>
      setOuvertes(prev => {
        const next = new Set(prev)
        if (next.has(cle)) next.delete(cle)
        else next.add(cle)
        return next
      }),
  }
}

export function SousCategorieAccordeon({
  emoji, label, count, ouvert, onToggle, children,
}: {
  emoji: string
  label: string
  count: number
  ouvert: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded-xl overflow-hidden mt-2.5" style={{ border: '1px solid #EEF0F2' }}>
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center justify-between text-left"
        style={{ background: '#F7F8FA' }}
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#1E2A26' }}>
            {emoji} {label}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: '#fff', color: '#6E827B' }}
          >
            {count}
          </span>
        </span>
        {ouvert
          ? <ChevronUp size={15} style={{ color: '#6E827B' }} />
          : <ChevronDown size={15} style={{ color: '#6E827B' }} />
        }
      </button>
      {ouvert && (
        <div className="px-3 py-3" style={{ background: '#fff' }}>
          {children}
        </div>
      )}
    </div>
  )
}
