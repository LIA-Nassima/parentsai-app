'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Session, Reponse, SessionAvecStats } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { normaliserPrenom } from '@/lib/normaliser'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'afaire' | 'progres' | 'planning'

const ICONES_MATIERE: Record<string, string> = {
  'Mathématiques': '🔢', 'Français': '📖', 'Physique-Chimie': '🧪',
  'SVT': '🌱', 'Technologie': '⚙️', 'Histoire-Géographie-EMC': '🌍',
  'Anglais': '🇬🇧', 'Espagnol': '🇪🇸', 'Allemand': '🇩🇪', 'Coach': '🧭',
}

function normaliserMatiere(m: string): string {
  const map: Record<string, string> = {
    'Maths': 'Mathématiques', 'Math': 'Mathématiques',
    'maths': 'Mathématiques', 'math': 'Mathématiques',
  }
  return map[m] ?? m
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function EspaceEnfant() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const prenom       = normaliserPrenom(decodeURIComponent(params.prenom as string))
  const activeTab    = (searchParams.get('tab') as Tab) || 'afaire'

  const [classe, setClasse] = useState('')

  // Charge la classe de l'enfant
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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'afaire',   label: 'À faire',  icon: '📚' },
    { id: 'progres',  label: 'Progrès',  icon: '🏆' },
    { id: 'planning', label: 'Planning', icon: '📅' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'white', borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Lien retour vers l'accueil */}
          <Link href="/" className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            ← Accueil
          </Link>

          {/* Nom + classe */}
          <div className="font-medium" style={{ fontFamily: 'Georgia, serif' }}>
            {prenom}
            {classe && (
              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>
                {classe}
              </span>
            )}
          </div>

          {/* Lien vue parent */}
          <Link
            href={`/espace/${encodeURIComponent(prenom)}`}
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            👩‍👧 Parent
          </Link>
        </div>

        {/* Onglets */}
        <div className="max-w-2xl mx-auto px-4 flex border-t" style={{ borderColor: 'var(--border)' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-3 text-xs font-medium transition-all"
              style={{
                color:        activeTab === t.id ? 'var(--primary)' : 'var(--muted-foreground)',
                borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Contenu ── */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'afaire'   && <TabAFaire prenom={prenom} />}
        {activeTab === 'progres'  && <TabProgres prenom={prenom} />}
        {activeTab === 'planning' && <TabPlanning prenom={prenom} />}
      </div>
    </div>
  )
}

// ─── Tab À faire ──────────────────────────────────────────────────────────────

function TabAFaire({ prenom }: { prenom: string }) {
  const [sessions, setSessions] = useState<SessionAvecStats[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function charger() {
      setLoading(true)
      const { data } = await supabase
        .from('sessions').select('*')
        .ilike('enfant', prenom)
        .in('statut', ['en_attente', 'fait'])
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

  if (loading) return (
    <div className="text-center py-16">
      <div className="text-3xl mb-3 animate-pulse">📚</div>
      <p style={{ color: 'var(--muted-foreground)' }}>Chargement...</p>
    </div>
  )

  if (sessions.length === 0) return (
    <div className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
      <div className="text-4xl mb-3">🎉</div>
      <p className="font-medium">Tout est fait !</p>
      <p className="text-sm mt-1">Aucune session en attente pour le moment.</p>
    </div>
  )

  return (
    <div>
      {/* Message d'encouragement */}
      <div className="rounded-2xl p-4 mb-5 text-center"
        style={{ background: 'white', border: '1px solid var(--border)' }}>
        <p className="font-medium">Salut <em style={{ color: 'var(--accent)' }}>{prenom}</em> ! 👋</p>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          {sessions.length} session{sessions.length > 1 ? 's' : ''} t'attend{sessions.length > 1 ? 'ent' : ''} !
        </p>
      </div>

      {/* Liste des sessions à faire */}
      <div className="space-y-3">
        {sessions.map(s => {
          const icone = ICONES_MATIERE[s.matiere] || '📚'
          const estFait = s.statut === 'fait'

          return (
            <Link
              key={s.id}
              href={`/session/${s.id}`}
              className="block rounded-2xl p-4 transition-all hover:shadow-md"
              style={{
                background: 'white',
                border: `2px solid ${estFait ? 'var(--accent)' : 'var(--primary)'}`,
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{icone}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{s.chapitre}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {s.matiere}
                    {s.type_evaluation === 'ds' && ' · 📝 DS'}
                    {s.type_evaluation === 'brevet_blanc' && ' · 🏆 Brevet Blanc'}
                  </div>
                </div>
                <div className="shrink-0">
                  {estFait ? (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: '#fdf0ed', color: 'var(--accent)' }}>
                      ✏️ Reprendre
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium text-white"
                      style={{ background: 'var(--primary)' }}>
                      Commencer →
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Tab Progrès ──────────────────────────────────────────────────────────────

function TabProgres({ prenom }: { prenom: string }) {
  const [sessions, setSessions] = useState<SessionAvecStats[]>([])
  const [loading, setLoading]   = useState(true)
  const [ouverteMat, setOuverteMat] = useState<string | null>(null)

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

  if (loading) return (
    <div className="text-center py-16">
      <div className="text-3xl mb-3 animate-pulse">⏳</div>
      <p style={{ color: 'var(--muted-foreground)' }}>Chargement...</p>
    </div>
  )

  if (sessions.length === 0) return (
    <div className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
      <div className="text-4xl mb-3">📖</div>
      <p>Aucune session pour l'instant.</p>
      <p className="text-sm mt-1">Commence ta première session dans "À faire" !</p>
    </div>
  )

  // Stats globales
  const totalValides = sessions.filter(s => s.statut === 'validé').length
  const totalQcm     = sessions.reduce((a, s) => a + s.qcm_total, 0)
  const totalJuste   = sessions.reduce((a, s) => a + s.qcm_juste, 0)
  const pctReussite  = totalQcm > 0 ? Math.round(totalJuste / totalQcm * 100) : null

  // Groupement par matière (sessions validées uniquement)
  const sessionsFaites = sessions.filter(s => s.statut === 'validé')
  const parMatiere = sessionsFaites.reduce<Record<string, SessionAvecStats[]>>((acc, s) => {
    if (!acc[s.matiere]) acc[s.matiere] = []
    acc[s.matiere].push(s)
    return acc
  }, {})

  return (
    <div>
      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Matières',  value: Object.keys(parMatiere).length },
          { label: 'Validées',  value: totalValides },
          { label: 'Réussite',  value: pctReussite !== null ? `${pctReussite}%` : '—' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="text-2xl font-light mb-0.5"
                style={{ color: stat.label === 'Réussite' && pctReussite !== null
                  ? pctReussite >= 70 ? '#2d7a4f' : 'var(--accent)'
                  : 'inherit' }}>
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(parMatiere).length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
          <p className="text-sm">Aucune session validée encore.</p>
          <p className="text-sm mt-1">Tes progrès apparaîtront ici une fois tes sessions terminées !</p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(parMatiere).map(([matiere, sessMat]) => {
            const icone    = ICONES_MATIERE[matiere] || '📚'
            const ouvert   = ouverteMat === matiere
            const qcmTotal = sessMat.reduce((a, s) => a + s.qcm_total, 0)
            const qcmJuste = sessMat.reduce((a, s) => a + s.qcm_juste, 0)
            const pct      = qcmTotal > 0 ? Math.round(qcmJuste / qcmTotal * 100) : null

            return (
              <div key={matiere} className="rounded-xl overflow-hidden"
                style={{ background: 'white', border: '1px solid var(--border)' }}>

                <button
                  onClick={() => setOuverteMat(ouvert ? null : matiere)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icone}</span>
                    <div>
                      <div className="font-medium text-sm">{matiere}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {sessMat.length} session{sessMat.length > 1 ? 's' : ''} validée{sessMat.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {pct !== null && (
                      <span className="text-sm font-medium"
                        style={{ color: pct >= 70 ? '#2d7a4f' : 'var(--accent)' }}>
                        {pct}%
                      </span>
                    )}
                    <span style={{
                      color: 'var(--muted-foreground)',
                      display: 'inline-block',
                      transition: 'transform 0.2s',
                      transform: ouvert ? 'rotate(180deg)' : 'none',
                    }}>⌄</span>
                  </div>
                </button>

                {ouvert && (
                  <div className="border-t px-4 pb-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="space-y-2 mt-3">
                      {sessMat.map(s => {
                        const date  = new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                        const score = s.qcm_total > 0 ? `${s.qcm_juste}/${s.qcm_total}` : null

                        return (
                          <Link key={s.id} href={`/session/${s.id}`}
                            className="flex items-center justify-between py-2 hover:opacity-70 transition-opacity"
                            style={{ borderBottom: '1px solid var(--border)' }}>
                            <div>
                              <p className="text-xs font-medium">{s.chapitre}</p>
                              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{date}</p>
                            </div>
                            {score && (
                              <span className="text-xs font-medium" style={{ color: '#2d7a4f' }}>
                                ✅ {score}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
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
    <div className="rounded-2xl p-6 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
      <div className="text-5xl mb-4">📅</div>
      <h2 className="text-lg font-medium mb-2">Mon planning</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
        Consulte ton planning de révision de la semaine.
      </p>
      <a
        href={`/planning/${encodeURIComponent(prenom)}`}
        className="inline-block px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--primary)' }}
      >
        📅 Voir mon planning
      </a>
    </div>
  )
}
