'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { decalerSemaine, formaterSemaine, lundiCourant, estSemaineCourante } from '@/lib/semaine'

export function SelecteurSemaine({
  semaineDebut, onChange,
}: {
  semaineDebut: string
  onChange: (lundiIso: string) => void
}) {
  const courante = estSemaineCourante(semaineDebut)

  return (
    <div className="flex items-center justify-between gap-2 mb-4">
      <button
        onClick={() => onChange(decalerSemaine(semaineDebut, -1))}
        className="w-9 h-9 flex items-center justify-center rounded-full shrink-0 transition-opacity active:opacity-70"
        style={{ background: '#fff', border: '1px solid #DCE8E4', color: '#2E7D6B' }}
        aria-label="Semaine précédente"
      >
        <ChevronLeft size={18} />
      </button>

      <button
        onClick={() => onChange(lundiCourant())}
        className="flex-1 flex flex-col items-center py-1.5 rounded-xl transition-opacity active:opacity-70"
        style={{ cursor: courante ? 'default' : 'pointer' }}
      >
        <span className="text-sm font-bold" style={{ color: '#1E2A26' }}>
          Semaine du {formaterSemaine(semaineDebut)}
        </span>
        <span className="text-xs" style={{ color: courante ? '#6E827B' : '#2E7D6B' }}>
          {courante ? 'cette semaine' : '↺ revenir à cette semaine'}
        </span>
      </button>

      <button
        onClick={() => onChange(decalerSemaine(semaineDebut, 1))}
        className="w-9 h-9 flex items-center justify-center rounded-full shrink-0 transition-opacity active:opacity-70"
        style={{ background: '#fff', border: '1px solid #DCE8E4', color: '#2E7D6B' }}
        aria-label="Semaine suivante"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
