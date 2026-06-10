'use client'

import Link from 'next/link'
import { Home, ChevronDown } from 'lucide-react'

interface Props {
  prenom: string
  classe?: string
  titrePage?: string
  onChangerEnfant?: () => void
}

export function AppHeader({ prenom, classe, titrePage, onChangerEnfant }: Props) {
  const initiale = prenom.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full" style={{ background: '#2E7D6B' }}>
      {/* Zone principale */}
      <div
        className="max-w-app mx-auto px-4 pt-3 pb-4"
        style={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
      >
        {/* Ligne 1 : avatar | pilule nom | icône accueil */}
        <div className="flex items-center justify-between">
          {/* Avatar initiale */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: 'rgba(255,255,255,0.22)', color: '#fff' }}
          >
            {initiale}
          </div>

          {/* Pilule sélecteur d'enfant */}
          <button
            onClick={onChangerEnfant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            <span className="uppercase tracking-wide text-xs font-bold">{prenom}</span>
            {classe && (
              <span className="text-xs font-normal opacity-80">{classe}</span>
            )}
            {onChangerEnfant && <ChevronDown size={14} strokeWidth={2.5} />}
          </button>

          {/* Icône accueil */}
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          >
            <Home size={18} strokeWidth={2} />
          </Link>
        </div>

        {/* Titre de page */}
        {titrePage && (
          <p className="text-center text-white text-xs font-medium mt-2 opacity-80 uppercase tracking-widest">
            {titrePage}
          </p>
        )}
      </div>
    </header>
  )
}
