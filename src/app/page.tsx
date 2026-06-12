'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Plus, ExternalLink, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#fff' }}>
      <div className="text-center">
        <LogoIAla size={48} dark />
        <p className="mt-4 text-sm" style={{ color: '#6E827B' }}>Chargement...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>

      {/* ── En-tête vert ── */}
      <div
        className="w-full"
        style={{ background: '#2E7D6B', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
      >
        {/* Déconnexion en haut à droite */}
        <div className="flex justify-end px-5 pt-5">
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            className="flex items-center gap-1.5 text-white/50 text-xs hover:text-white/80 transition-colors"
          >
            <LogOut size={13} />
            Déconnexion
          </button>
        </div>

        {/* Logo centré */}
        <div className="flex flex-col items-center text-center px-5 pt-4 pb-10">
          <LogoIAla size={52} dark={false} />
          <p
            className="text-white/60 mt-2 uppercase tracking-widest"
            style={{ fontSize: 10, letterSpacing: '0.18em' }}
          >
            le professeur particulier IA
          </p>
          <p className="text-white/80 text-sm mt-1 italic">allez, on révise</p>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-app mx-auto px-4 pt-6 pb-10 space-y-3">

        <p className="text-xs uppercase tracking-widest font-semibold px-1 mb-4" style={{ color: '#6E827B' }}>
          Mes enfants
        </p>

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
              className="block rounded-2xl overflow-hidden transition-all active:scale-[0.99]"
              style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #F0F0F2' }}
            >
              <div className="flex items-center gap-4 px-4 py-4">
                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
                  style={{ background: couleurBg }}
                >
                  {f.enfant.charAt(0).toUpperCase()}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg leading-tight" style={{ color: '#1E2A26' }}>
                    {f.enfant}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: couleurClasse + '20', color: couleurClasse }}
                    >
                      {f.classe}
                    </span>
                    {/* Indicateur profs — icône seulement, pas de texte */}
                    {!tousConfigures && nbProfs === 0 && (
                      <AlertCircle size={15} style={{ color: '#E8B53A' }} />
                    )}
                    {tousConfigures && (
                      <CheckCircle2 size={15} style={{ color: '#2E7D6B' }} />
                    )}
                    {nbProfs > 0 && !tousConfigures && (
                      <span className="text-xs font-semibold" style={{ color: '#B8881F' }}>
                        {nbProfs}/8 profs
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight size={20} style={{ color: '#C0C4CC' }} />
              </div>

              {/* Barre de progression profs */}
              {nbProfs > 0 && !tousConfigures && (
                <div className="px-4 pb-3.5">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F0F1F3' }}>
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

        {/* Ajouter un enfant */}
        <a
          href="/onboarding"
          className="flex items-center justify-center gap-2 w-full rounded-2xl py-4 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ border: '1.5px dashed #DCE8E4', color: '#6E827B' }}
        >
          <Plus size={17} />
          Ajouter un enfant
        </a>

        {/* Lien Claude.ai */}
        <a
          href="https://claude.ai/projects"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full rounded-2xl px-4 py-3.5 transition-opacity hover:opacity-80"
          style={{ background: '#F7F8FA', border: '1px solid #EBEBED' }}
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

        <p className="text-center text-xs pt-2" style={{ color: '#C0C4CC' }}>
          IAla · propulsé par Claude + MCP
        </p>
      </div>
    </div>
  )
}
