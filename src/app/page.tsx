'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Plus, ExternalLink, LogOut } from 'lucide-react'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { supabase } from '@/lib/supabase'
import { Famille } from '@/types'

const COULEURS_CLASSE: Record<string, string> = {
  '6ème': '#5BA491', '5ème': '#3B7DD9', '4ème': '#2E7D6B',
  '3ème': '#1F5A4D', '2nde': '#B8881F', '1ère': '#E8B53A', 'Terminale': '#D9483B',
}

const INITIALE_BG: string[] = [
  '#2E7D6B', '#3B7DD9', '#E8B53A', '#D9483B', '#5BA491', '#B8881F',
]

export default function Home() {
  const router  = useRouter()
  const [familles, setFamilles] = useState<Famille[]>([])
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    async function charger() {
      try {
        const res  = await fetch('https://mcp.parentsai.eu/api/familles')
        const json = await res.json()
        const data: Famille[] = json.familles || []
        if (data.length === 0) { router.push('/onboarding'); return }
        setFamilles(data)
      } catch {
        router.push('/onboarding')
        return
      }
      setLoading(false)
    }
    charger()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F8FA' }}>
      <div className="text-center">
        <LogoIAla size={40} dark />
        <p className="mt-4 text-sm" style={{ color: '#6E827B' }}>Chargement...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#F7F8FA' }}>

      {/* ── En-tête vert ── */}
      <div style={{ background: '#2E7D6B' }}>
        <div
          className="max-w-app mx-auto px-5 pt-8 pb-6"
          style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24, background: '#2E7D6B' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <LogoIAla size={34} dark={false} />
              <p className="text-white/70 text-xs mt-1 tracking-wide">allez, on révise</p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="flex items-center gap-1.5 text-white/60 text-xs hover:text-white/90 transition-colors mt-1"
            >
              <LogOut size={14} />
              Déconnexion
            </button>
          </div>

          {/* Titre section */}
          <p className="text-white font-semibold text-lg mt-5">
            Mes enfants
          </p>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-app mx-auto px-4 py-5 space-y-3">

        {/* Cartes enfants */}
        {familles.map((f, idx) => {
          const nbProfs        = (f.profs_configures || []).length
          const tousConfigures = nbProfs >= 8
          const couleurBg      = INITIALE_BG[idx % INITIALE_BG.length]
          const couleurClasse  = COULEURS_CLASSE[f.classe] || '#2E7D6B'

          return (
            <a
              key={f.enfant}
              href={`/espace/${encodeURIComponent(f.enfant)}`}
              className="block rounded-2xl overflow-hidden transition-transform active:scale-[0.99]"
              style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-4 px-4 py-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                  style={{ background: couleurBg }}
                >
                  {f.enfant.charAt(0).toUpperCase()}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base" style={{ color: '#1E2A26' }}>
                    {f.enfant}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: couleurClasse + '1a', color: couleurClasse }}
                    >
                      {f.classe}
                    </span>
                    <span className="text-xs" style={{ color: '#6E827B' }}>
                      {nbProfs === 0
                        ? 'Profs à configurer'
                        : tousConfigures
                          ? `${nbProfs} profs ✓`
                          : `${nbProfs} profs`}
                    </span>
                  </div>
                </div>

                <ChevronRight size={18} style={{ color: '#6E827B' }} />
              </div>

              {/* Barre de progression profs */}
              {nbProfs > 0 && !tousConfigures && (
                <div className="px-4 pb-3">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: '#E3F0EC' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(nbProfs / 8) * 100}%`, background: '#2E7D6B' }}
                    />
                  </div>
                </div>
              )}
            </a>
          )
        })}

        {/* Lien Claude.ai */}
        <a
          href="https://claude.ai/projects"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full rounded-2xl px-4 py-3.5 transition-opacity hover:opacity-80"
          style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
              style={{ background: '#E3F0EC' }}
            >
              🤖
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1E2A26' }}>Claude.ai</p>
              <p className="text-xs" style={{ color: '#6E827B' }}>Mes projets professeurs</p>
            </div>
          </div>
          <ExternalLink size={16} style={{ color: '#6E827B' }} />
        </a>

        {/* Ajouter un enfant */}
        <a
          href="/onboarding"
          className="flex items-center justify-center gap-2 w-full rounded-2xl py-3.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ border: '1.5px dashed #DCE8E4', color: '#6E827B' }}
        >
          <Plus size={16} />
          Ajouter un enfant
        </a>

        <p className="text-center text-xs pt-2 pb-6" style={{ color: '#6E827B' }}>
          IAlla · propulsé par Claude + MCP
        </p>
      </div>
    </div>
  )
}
