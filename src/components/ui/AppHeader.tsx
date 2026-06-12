'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, ChevronDown } from 'lucide-react'

interface FamilleOption {
  enfant: string
  classe?: string
}

interface Props {
  prenom: string
  classe?: string
  titrePage?: string
  familles?: FamilleOption[]
}

const COULEURS_AVATAR = ['#2E7D6B', '#3B7DD9', '#E8B53A', '#D9483B', '#5BA491', '#B8881F']

export function AppHeader({ prenom, classe, titrePage, familles = [] }: Props) {
  const router   = useRouter()
  const initiale = prenom.charAt(0).toUpperCase()
  const [ouvert, setOuvert] = useState(false)

  const autresEnfants = familles.filter(f => f.enfant.toLowerCase() !== prenom.toLowerCase())
  const aDropdown = autresEnfants.length > 0

  function allerVers(enfant: string) {
    router.push(`/espace/${encodeURIComponent(enfant)}`)
    setOuvert(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full" style={{ background: '#2E7D6B' }}>
      <div
        className="max-w-app mx-auto px-4 pt-3 pb-4"
        style={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
      >
        {/* Ligne : avatar | pilule | accueil */}
        <div className="flex items-center justify-between">

          {/* Avatar initiale */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: 'rgba(255,255,255,0.22)', color: '#fff' }}
          >
            {initiale}
          </div>

          {/* Pilule sélecteur — style Pronote */}
          <div className="relative">
            <button
              onClick={() => aDropdown && setOuvert(v => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full transition-opacity hover:opacity-80"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                cursor: aDropdown ? 'pointer' : 'default',
              }}
            >
              <span className="uppercase tracking-wide text-xs font-extrabold">{prenom}</span>
              {classe && (
                <span
                  className="text-xs font-normal px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  {classe}
                </span>
              )}
              {aDropdown && (
                <ChevronDown
                  size={14}
                  strokeWidth={2.5}
                  style={{
                    transition: 'transform 0.2s',
                    transform: ouvert ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              )}
            </button>

            {/* Dropdown des autres enfants */}
            {ouvert && (
              <>
                {/* Overlay pour fermer au clic extérieur */}
                <div className="fixed inset-0 z-40" onClick={() => setOuvert(false)} />

                <div
                  className="absolute top-full mt-2 z-50 rounded-2xl overflow-hidden"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    minWidth: 190,
                  }}
                >
                  <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #DCE8E4' }}>
                    <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#6E827B' }}>
                      Changer d'enfant
                    </p>
                  </div>

                  {autresEnfants.map((f, idx) => (
                    <button
                      key={f.enfant}
                      onClick={() => allerVers(f.enfant)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      style={{
                        borderBottom: idx < autresEnfants.length - 1 ? '1px solid #F0F0F2' : 'none',
                        background: 'transparent',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F7F8FA')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: COULEURS_AVATAR[idx % COULEURS_AVATAR.length] }}
                      >
                        {f.enfant.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#1E2A26' }}>{f.enfant}</p>
                        {f.classe && (
                          <p className="text-xs" style={{ color: '#6E827B' }}>{f.classe}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Icône home */}
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          >
            <Home size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Titre de page optionnel */}
        {titrePage && (
          <p className="text-center text-white text-xs font-medium mt-2 opacity-80 uppercase tracking-widest">
            {titrePage}
          </p>
        )}
      </div>
    </header>
  )
}
