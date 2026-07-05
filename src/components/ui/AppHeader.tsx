'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, Settings, Plus } from 'lucide-react'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { supabase } from '@/lib/supabase'

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

const COULEURS_AVATAR = ['#E8B53A', '#3B7DD9', '#D9483B', '#5BA491', '#B8881F', '#2E7D6B']

export function AppHeader({ prenom, classe, titrePage, familles = [] }: Props) {
  const router   = useRouter()
  const initiale = prenom.charAt(0).toUpperCase()
  const [ouvert, setOuvert] = useState(false)

  const autresEnfants = familles.filter(f => f.enfant.toLowerCase() !== prenom.toLowerCase())
  const aDropdown = true  // le menu s'ouvre toujours (changer d'enfant + ajouter + configuration)

  function allerVers(enfant: string) {
    router.push(`/espace/${encodeURIComponent(enfant)}`)
    setOuvert(false)
  }

  async function deconnexion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'linear-gradient(155deg, #35907B 0%, #2E7D6B 45%, #1F5A4D 100%)',
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
        boxShadow: '0 4px 20px rgba(31,90,77,0.25)',
      }}
    >
      {/* Calque décoratif clippé — n'affecte pas le dropdown */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}
        aria-hidden="true"
      >
        <svg
          width={200} height={200} viewBox="-12 -12 24 24"
          style={{ position: 'absolute', top: -56, right: -44, opacity: 0.08 }}
        >
          <path
            d="M0 -9.5 L2.3 -2.9 L9.2 -2.9 L3.6 1.3 L5.7 8 L0 3.8 L-5.7 8 L-3.6 1.3 L-9.2 -2.9 L-2.3 -2.9 Z"
            fill="#fff"
          />
        </svg>
      </div>

      <div className="relative max-w-app mx-auto px-4 pt-3.5 pb-5">

        {/* Configuration — coin haut gauche */}
        <button
          onClick={() => router.push('/parametres')}
          className="absolute top-3 left-4 w-9 h-9 flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          aria-label="Configuration"
        >
          <Settings size={17} strokeWidth={2} />
        </button>

        {/* Déconnexion — coin haut droit */}
        <button
          onClick={deconnexion}
          className="absolute top-3 right-4 w-9 h-9 flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          aria-label="Déconnexion"
        >
          <LogOut size={17} strokeWidth={2} />
        </button>

        {/* Bloc centré : logo + accroches */}
        <div className="flex flex-col items-center text-center">
          <button
            onClick={() => router.push('/')}
            className="transition-opacity hover:opacity-80"
          >
            <LogoIAla size={46} dark={false} />
          </button>
          <p
            className="mt-2 uppercase"
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, letterSpacing: '0.18em' }}
          >
            le professeur particulier IA
          </p>
          <p className="italic mt-0.5" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
            allez, on révise
          </p>
        </div>

        {/* Pilule sélecteur enfant — centrée et premium */}
        <div className="flex justify-center mt-4">
          <div className="relative">
            <button
              onClick={() => aDropdown && setOuvert(v => !v)}
              className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full transition-transform active:scale-[0.97]"
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                cursor: aDropdown ? 'pointer' : 'default',
              }}
            >
              {/* Mini-avatar doré */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0"
                style={{ background: '#E8B53A', color: '#7a5910' }}
              >
                {initiale}
              </div>
              <span className="uppercase tracking-wide text-sm font-extrabold text-white">{prenom}</span>
              {classe && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#E8B53A', color: '#7a5910' }}
                >
                  {classe}
                </span>
              )}
              {aDropdown && (
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  color="#fff"
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
                <div className="fixed inset-0 z-40" onClick={() => setOuvert(false)} />
                <div
                  className="absolute top-full mt-2 z-50 rounded-2xl overflow-hidden"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    boxShadow: '0 10px 36px rgba(0,0,0,0.2)',
                    minWidth: 200,
                  }}
                >
                  {autresEnfants.length > 0 && (
                    <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #DCE8E4' }}>
                      <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#6E827B' }}>
                        Changer d'enfant
                      </p>
                    </div>
                  )}
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

                  {/* Actions : ajouter un enfant / configuration */}
                  <button
                    onClick={() => { setOuvert(false); router.push('/parametres') }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    style={{ borderTop: '1px solid #F0F0F2', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F7F8FA')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#E3F0EC', color: '#1F5A4D' }}>
                      <Plus size={18} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: '#1E2A26' }}>Ajouter un enfant</p>
                  </button>
                  <button
                    onClick={() => { setOuvert(false); router.push('/parametres') }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    style={{ borderTop: '1px solid #F0F0F2', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F7F8FA')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F1EFE8', color: '#5F5E5A' }}>
                      <Settings size={17} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: '#1E2A26' }}>Configuration</p>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Titre de page optionnel */}
        {titrePage && (
          <p className="text-center text-white text-xs font-medium mt-3 opacity-80 uppercase tracking-widest">
            {titrePage}
          </p>
        )}
      </div>
    </header>
  )
}
