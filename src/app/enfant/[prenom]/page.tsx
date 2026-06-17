'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { grouperParType, useSousOuvertes, SousCategorieAccordeon } from '@/components/ui/SousCategorie'
import { supabase } from '@/lib/supabase'
import { Session, Reponse, SessionAvecStats } from '@/types'
import { normaliserPrenom } from '@/lib/normaliser'

type Tab = 'revisions' | 'planning'
type Filtre = 'afaire' | 'valide'

const ICONES_MATIERE: Record<string, string> = {
  'Mathématiques': '🔢', 'Français': '📖', 'Physique-Chimie': '🧪',
  'SVT': '🌱', 'Technologie': '⚙️', 'Histoire-Géographie-EMC': '🌍',
  'Anglais': '🇬🇧', 'Espagnol': '🇪🇸', 'Allemand': '🇩🇪', 'Coach': '🧭',
}

const COULEURS_MATIERE: Record<string, string> = {
  'Mathématiques': '#3B7DD9', 'Français': '#2E7D6B', 'Physique-Chimie': '#5BA491',
  'SVT': '#1F5A4D', 'Technologie': '#B8881F', 'Histoire-Géographie-EMC': '#E8B53A',
  'Anglais': '#3B7DD9', 'Espagnol': '#E2685C', 'Allemand': '#6E827B',
}

function normaliserMatiere(m: string): string {
  const map: Record<string, string> = {
    'Maths': 'Mathématiques', 'Math': 'Mathématiques',
    'maths': 'Mathématiques', 'math': 'Mathématiques',
  }
  return map[m] ?? m
}

function CarteAFaire({ s, retourQuery }: { s: SessionAvecStats; retourQuery: string }) {
  const estFait = s.statut === 'fait'
  return (
    <Link
      href={`/session/${s.id}?${retourQuery}`}
      className="flex items-center justify-between p-4 rounded-xl transition-opacity active:opacity-70"
      style={{
        background: estFait ? '#FDF8EA' : '#F7F8FA',
        border: `1.5px solid ${estFait ? '#E8B53A' : '#DCE8E4'}`,
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: '#1E2A26' }}>{s.chapitre}</p>
        <p className="text-xs mt-0.5" style={{ color: '#6E827B' }}>
          {new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </p>
      </div>
      <span
        className="text-xs px-3 py-1.5 rounded-xl font-bold ml-3 shrink-0"
        style={{ background: estFait ? '#E8B53A' : '#2E7D6B', color: '#fff' }}
      >
        {estFait ? 'À corriger' : 'Commencer →'}
      </span>
    </Link>
  )
}

function LigneValide({ s, retourQuery }: { s: SessionAvecStats; retourQuery: string }) {
  const date  = new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  const score = s.qcm_total > 0 ? `${s.qcm_juste}/${s.qcm_total}` : null
  return (
    <Link
      href={`/session/${s.id}?${retourQuery}`}
      className="flex items-center justify-between py-2.5 transition-opacity hover:opacity-70"
      style={{ borderBottom: '1px solid #DCE8E4' }}
    >
      <div>
        <p className="text-xs font-semibold" style={{ color: '#1E2A26' }}>{s.chapitre}</p>
        <p className="text-xs" style={{ color: '#6E827B' }}>{date}</p>
      </div>
      {score && (
        <span className="text-xs font-bold" style={{ color: '#1F5A4D' }}>✅ {score}</span>
      )}
    </Link>
  )
}

const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'revisions', label: 'Révisions', Icon: BookOpen },
  { id: 'planning',  label: 'Planning',  Icon: CalendarDays },
]

function EcranAccesRefuse() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F7F8FA' }}>
      <div className="text-center max-w-xs">
        <div className="text-6xl mb-5">🔒</div>
        <p className="font-bold text-lg mb-2" style={{ color: '#1E2A26' }}>Accès refusé</p>
        <p className="text-sm" style={{ color: '#6E827B' }}>
          Demande à tes parents de scanner le QR code pour toi.
        </p>
      </div>
    </div>
  )
}

export default function EspaceEnfant() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const prenom       = normaliserPrenom(decodeURIComponent(params.prenom as string))
  const activeTab    = (searchParams.get('tab') as Tab) || 'revisions'

  const [classe, setClasse]             = useState('')
  const [tokenVerifie, setTokenVerifie] = useState<boolean | null>(null)

  useEffect(() => {
    async function verifierToken() {
      if (localStorage.getItem(`qr_ok_${prenom}`) === '1') {
        setTokenVerifie(true)
        return
      }
      const p = new URLSearchParams(window.location.search)
      const token = p.get('t')
      if (!token) { setTokenVerifie(false); return }
      try {
        const res = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enfant: prenom, token }),
        })
        if (res.ok) {
          localStorage.setItem(`qr_ok_${prenom}`, '1')
          window.history.replaceState({}, '', `/enfant/${encodeURIComponent(prenom)}`)
          setTokenVerifie(true)
        } else {
          setTokenVerifie(false)
        }
      } catch {
        setTokenVerifie(false)
      }
    }
    verifierToken()
  }, [prenom])

  useEffect(() => {
    async function chargerFamille() {
      try {
        const res  = await fetch('https://mcp.parentsai.eu/api/familles')
        const json = await res.json()
        const famille = (json.familles || []).find(
          (f: { enfant: string; classe: string }) =>
            f.enfant.toLowerCase() === prenom.toLowerCase()
        )
        if (famille) setClasse(famille.classe || '')
      } catch { /* silencieux */ }
    }
    chargerFamille()
  }, [prenom])

  function setTab(tab: Tab) {
    router.push(`/enfant/${encodeURIComponent(prenom)}?tab=${tab}`)
  }

  if (tokenVerifie === null) return null
  if (!tokenVerifie) return <EcranAccesRefuse />

  const initiale = prenom.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F7F8FA' }}>

      {/* ── En-tête vert ── */}
      <header className="sticky top-0 z-50 w-full" style={{ background: '#2E7D6B' }}>
        <div
          className="max-w-app mx-auto px-4 pt-4 pb-5"
          style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
        >
          <div className="flex items-center mb-3">
            <LogoIAla size={28} dark={false} />
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
              style={{ background: 'rgba(255,255,255,0.25)' }}
            >
              {initiale}
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                Salut {prenom} ! 👋
              </p>
              {classe && (
                <p className="text-white/70 text-xs">{classe} · allez, on révise</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Contenu ── */}
      <div className="max-w-app mx-auto px-4 py-5">
        {activeTab === 'revisions' && <TabRevisions prenom={prenom} classe={classe} />}
        {activeTab === 'planning'  && <TabPlanning prenom={prenom} />}
      </div>

      {/* ── Barre de navigation basse ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: '#fff', borderTop: '1px solid #DCE8E4' }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const actif = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1.5 transition-colors relative"
              style={{ color: actif ? '#2E7D6B' : '#6E827B' }}
            >
              <Icon size={26} strokeWidth={actif ? 2.5 : 1.8} />
              <span className="font-semibold" style={{ fontSize: 11 }}>{label}</span>
              {actif && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ background: '#2E7D6B' }} />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// ─── Tab Révisions (À faire + Validé fusionnés) ────────────────────────────────

function TabRevisions({ prenom, classe }: { prenom: string; classe: string }) {
  const searchParams = useSearchParams()
  const matInit = searchParams.get('mat')
  const catInit = searchParams.get('cat')
  const cleInit = matInit && catInit ? `${matInit}::${catInit}` : undefined

  const [sessions, setSessions]     = useState<SessionAvecStats[]>([])
  const [loading, setLoading]       = useState(true)
  const [filtre, setFiltre]         = useState<Filtre>((searchParams.get('filtre') as Filtre) || 'afaire')
  const [ouverteMat, setOuverteMat] = useState<string | null>(matInit)

  useEffect(() => {
    async function charger() {
      setLoading(true)
      const { data } = await supabase
        .from('sessions').select('*')
        .ilike('enfant', prenom)
        .order('created_at', { ascending: false })

      if (!data) { setLoading(false); return }

      const avecStats: SessionAvecStats[] = await Promise.all(
        data.map(async (s: Session) => {
          const { data: rep } = await supabase
            .from('reponses').select('*').eq('session_id', s.id)
          const r = (rep || []) as Reponse[]
          return {
            ...s,
            matiere:    normaliserMatiere(s.matiere),
            qcm_total:  r.filter(x => x.type === 'qcm').length,
            qcm_juste:  r.filter(x => x.type === 'qcm' && x.est_correct).length,
            pb_termine: r.filter(x => x.type === 'probleme' && x.est_termine).length,
          }
        })
      )
      setSessions(avecStats)
      setLoading(false)
    }
    charger()
  }, [prenom])

  const aFaire = sessions.filter(s => s.statut === 'en_attente' || s.statut === 'fait')
  const valide = sessions.filter(s => s.statut === 'validé')

  if (loading) return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: '#6E827B' }}>Chargement...</p>
    </div>
  )

  if (sessions.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">📖</div>
      <p className="font-bold" style={{ color: '#1E2A26' }}>Pas encore de session.</p>
      <p className="text-sm mt-2" style={{ color: '#6E827B' }}>Demande à tes parents de lancer une session !</p>
    </div>
  )

  return (
    <div>
      {/* Sélecteur segmenté À faire / Validé */}
      <div
        className="flex gap-1 p-1 rounded-full mb-5"
        style={{ background: '#EAEDF0' }}
      >
        {([
          { id: 'afaire' as Filtre, label: 'À faire', count: aFaire.length },
          { id: 'valide' as Filtre, label: 'Validé',  count: valide.length },
        ]).map(seg => {
          const actif = filtre === seg.id
          return (
            <button
              key={seg.id}
              onClick={() => { setFiltre(seg.id); setOuverteMat(null) }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all"
              style={{
                background: actif ? '#fff' : 'transparent',
                color: actif ? '#1E2A26' : '#6E827B',
                boxShadow: actif ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {seg.label}
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{
                  background: actif ? (seg.id === 'valide' ? '#E3F0EC' : '#FBE6E3') : 'rgba(0,0,0,0.06)',
                  color: actif ? (seg.id === 'valide' ? '#1F5A4D' : '#D9483B') : '#6E827B',
                }}
              >
                {seg.count}
              </span>
            </button>
          )
        })}
      </div>

      {filtre === 'afaire'
        ? <VueAFaire sessions={aFaire} classe={classe} ouverteMat={ouverteMat} setOuverteMat={setOuverteMat} ouvertureInitiale={cleInit} />
        : <VueValide  sessions={valide} classe={classe} ouverteMat={ouverteMat} setOuverteMat={setOuverteMat} ouvertureInitiale={cleInit} />
      }
    </div>
  )
}

// ─── Vue « À faire » ───────────────────────────────────────────────────────────

function VueAFaire({
  sessions, classe, ouverteMat, setOuverteMat, ouvertureInitiale,
}: {
  sessions: SessionAvecStats[]
  classe: string
  ouverteMat: string | null
  setOuverteMat: (m: string | null) => void
  ouvertureInitiale?: string
}) {
  const sous = useSousOuvertes(ouvertureInitiale ? [ouvertureInitiale] : [])

  if (sessions.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🎉</div>
      <p className="font-bold text-lg" style={{ color: '#1E2A26' }}>Tout est fait !</p>
      <p className="text-sm mt-2" style={{ color: '#6E827B' }}>Toutes tes sessions sont validées. Bravo !</p>
    </div>
  )

  const parMatiere = sessions.reduce<Record<string, SessionAvecStats[]>>((acc, s) => {
    if (!acc[s.matiere]) acc[s.matiere] = []
    acc[s.matiere].push(s)
    return acc
  }, {})

  return (
    <div>
      <div
        className="rounded-2xl p-4 mb-5 text-center"
        style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <p className="font-bold" style={{ color: '#1E2A26' }}>
          {sessions.length} session{sessions.length > 1 ? 's' : ''} t'attend{sessions.length > 1 ? 'ent' : ''} dans{' '}
          {Object.keys(parMatiere).length} matière{Object.keys(parMatiere).length > 1 ? 's' : ''} 💪
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(parMatiere).map(([matiere, sessMat]) => {
          const couleur = COULEURS_MATIERE[matiere] || '#2E7D6B'
          const ouvert  = ouverteMat === matiere
          const nbFait  = sessMat.filter(s => s.statut === 'fait').length

          return (
            <div
              key={matiere}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <button
                onClick={() => setOuverteMat(ouvert ? null : matiere)}
                className="w-full px-4 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-12 rounded-full shrink-0" style={{ background: couleur }} />
                  <div>
                    <div className="font-bold text-base uppercase tracking-wide" style={{ color: '#1E2A26' }}>
                      {matiere}
                    </div>
                    <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: '#6E827B' }}>
                      {sessMat.length} session{sessMat.length > 1 ? 's' : ''}
                      {nbFait > 0 && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: '#FBE6E3', color: '#D9483B' }}
                        >
                          {nbFait} à corriger
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {ouvert
                  ? <ChevronUp size={18} style={{ color: '#6E827B' }} />
                  : <ChevronDown size={18} style={{ color: '#6E827B' }} />
                }
              </button>

              {ouvert && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: '#DCE8E4' }}>
                  {grouperParType(sessMat, classe).map(({ cat, items }) => {
                    const cle = `${matiere}::${cat.id}`
                    const retourQuery = `from=enfant&filtre=afaire&mat=${encodeURIComponent(matiere)}&cat=${cat.id}`
                    return (
                      <SousCategorieAccordeon
                        key={cat.id}
                        emoji={cat.emoji} label={cat.label} count={items.length}
                        ouvert={sous.estOuverte(cle)} onToggle={() => sous.basculer(cle)}
                      >
                        <div className="space-y-2.5">
                          {items.map(s => <CarteAFaire key={s.id} s={s} retourQuery={retourQuery} />)}
                        </div>
                      </SousCategorieAccordeon>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Vue « Validé » ────────────────────────────────────────────────────────────

function VueValide({
  sessions, classe, ouverteMat, setOuverteMat, ouvertureInitiale,
}: {
  sessions: SessionAvecStats[]
  classe: string
  ouverteMat: string | null
  setOuverteMat: (m: string | null) => void
  ouvertureInitiale?: string
}) {
  const sous = useSousOuvertes(ouvertureInitiale ? [ouvertureInitiale] : [])
  const totalValides = sessions.length
  const totalQcm     = sessions.reduce((a, s) => a + s.qcm_total, 0)
  const totalJuste   = sessions.reduce((a, s) => a + s.qcm_juste, 0)
  const pctReussite  = totalQcm > 0 ? Math.round(totalJuste / totalQcm * 100) : null

  const parMatiere = sessions.reduce<Record<string, SessionAvecStats[]>>((acc, s) => {
    if (!acc[s.matiere]) acc[s.matiere] = []
    acc[s.matiere].push(s)
    return acc
  }, {})

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Matières',  value: Object.keys(parMatiere).length },
          { label: 'Validées',  value: totalValides },
          { label: 'Réussite',  value: pctReussite !== null ? `${pctReussite}%` : '—' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-2xl text-center py-4"
            style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="text-2xl font-bold" style={{ color: '#1F5A4D' }}>{stat.value}</div>
            <div className="text-xs mt-0.5 uppercase tracking-wide" style={{ color: '#6E827B', fontSize: 10 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(parMatiere).length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-sm font-semibold" style={{ color: '#6E827B' }}>Aucune session validée encore.</p>
          <p className="text-sm mt-1" style={{ color: '#6E827B' }}>Tes progrès apparaîtront ici !</p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(parMatiere).map(([matiere, sessMat]) => {
            const icone    = ICONES_MATIERE[matiere] || '📚'
            const couleur  = COULEURS_MATIERE[matiere] || '#2E7D6B'
            const ouvert   = ouverteMat === matiere
            const qcmTotal = sessMat.reduce((a, s) => a + s.qcm_total, 0)
            const qcmJuste = sessMat.reduce((a, s) => a + s.qcm_juste, 0)
            const pct      = qcmTotal > 0 ? Math.round(qcmJuste / qcmTotal * 100) : null

            return (
              <div
                key={matiere}
                className="rounded-2xl overflow-hidden"
                style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <button
                  onClick={() => setOuverteMat(ouvert ? null : matiere)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-10 rounded-full shrink-0" style={{ background: couleur }} />
                    <div>
                      <div className="font-bold text-sm uppercase tracking-wide" style={{ color: '#1E2A26' }}>
                        {icone} {matiere}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: '#6E827B' }}>
                        {sessMat.length} session{sessMat.length > 1 ? 's' : ''} validée{sessMat.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pct !== null && (
                      <span className="text-sm font-bold" style={{ color: '#1F5A4D' }}>{pct}%</span>
                    )}
                    {ouvert
                      ? <ChevronUp size={16} style={{ color: '#6E827B' }} />
                      : <ChevronDown size={16} style={{ color: '#6E827B' }} />
                    }
                  </div>
                </button>

                {ouvert && (
                  <div className="px-4 pb-3 border-t" style={{ borderColor: '#DCE8E4' }}>
                    {grouperParType(sessMat, classe).map(({ cat, items }) => {
                      const cle = `${matiere}::${cat.id}`
                      const retourQuery = `from=enfant&filtre=valide&mat=${encodeURIComponent(matiere)}&cat=${cat.id}`
                      return (
                        <SousCategorieAccordeon
                          key={cat.id}
                          emoji={cat.emoji} label={cat.label} count={items.length}
                          ouvert={sous.estOuverte(cle)} onToggle={() => sous.basculer(cle)}
                        >
                          <div className="space-y-1">
                            {items.map(s => <LigneValide key={s.id} s={s} retourQuery={retourQuery} />)}
                          </div>
                        </SousCategorieAccordeon>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Tab Planning ─────────────────────────────────────────────────────────────

function TabPlanning({ prenom }: { prenom: string }) {
  return (
    <div
      className="rounded-2xl p-6 text-center"
      style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="text-5xl mb-4">📅</div>
      <p className="font-bold text-base mb-2" style={{ color: '#1E2A26' }}>Mon planning</p>
      <p className="text-sm mb-6" style={{ color: '#6E827B' }}>
        Consulte ton planning de révision de la semaine.
      </p>
      <a
        href={`/planning/${encodeURIComponent(prenom)}`}
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90"
        style={{ background: '#2E7D6B' }}
      >
        Voir mon planning
      </a>
    </div>
  )
}
