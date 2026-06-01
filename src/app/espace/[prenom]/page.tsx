'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { normaliserPrenom } from '@/lib/normaliser'
import { supabase } from '@/lib/supabase'
import { Session, Reponse, SessionAvecStats } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

// ─── Types locaux ──────────────────────────────────────────────────────────────

type Tab = 'suivi' | 'exercices' | 'planning' | 'profs'

interface Professeur {
  matiere: string
  niveau: string
  template: string
  nom_projet: string
}

const STATUT_CONFIG = {
  'en_attente': { label: 'En attente', color: '#6b6560', bg: '#f0ebe6' },
  'fait':       { label: 'Fait',        color: '#c9543a', bg: '#fdf0ed' },
  'validé':     { label: 'Validé ✓',   color: '#2d7a4f', bg: '#edf7f2' },
}

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

// ─── Composant principal ───────────────────────────────────────────────────────

export default function EspaceEnfant() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const prenom       = normaliserPrenom(decodeURIComponent(params.prenom as string))
  const activeTab    = (searchParams.get('tab') as Tab) || 'suivi'

  // Données communes
  const [classe, setClasse] = useState('')
  const [profsConfigures, setProfsConfigures] = useState<string[]>([])

  // Charge la famille au montage
  useEffect(() => {
    async function chargerFamille() {
      try {
        const res  = await fetch('https://mcp.parentsai.eu/api/familles')
        const json = await res.json()
        const famille = (json.familles || []).find(
          (f: { enfant: string; classe: string; profs_configures: string[] }) =>
            f.enfant.toLowerCase() === prenom.toLowerCase()
        )
        if (famille) {
          setClasse(famille.classe || '')
          setProfsConfigures(famille.profs_configures || [])
        }
      } catch { /* silencieux */ }
    }
    chargerFamille()
  }, [prenom])

  function setTab(tab: Tab) {
    router.push(`/espace/${encodeURIComponent(prenom)}?tab=${tab}`)
  }

  // ── Navigation tabs ──────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'suivi',     label: 'Suivi',     icon: '📊' },
    { id: 'exercices', label: 'Exercices', icon: '📚' },
    { id: 'planning',  label: 'Planning',  icon: '📅' },
    { id: 'profs',     label: 'Profs',     icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'white', borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            ← Famille
          </Link>
          <div className="font-medium" style={{ fontFamily: 'Georgia, serif' }}>
            {prenom}
            {classe && (
              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>
                {classe}
              </span>
            )}
          </div>
          {/* Placeholder pour équilibrer le header */}
          <div className="w-16" />
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 flex border-t" style={{ borderColor: 'var(--border)' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-3 text-xs font-medium transition-all"
              style={{
                color:       activeTab === t.id ? 'var(--primary)' : 'var(--muted-foreground)',
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
        {activeTab === 'suivi'     && <TabSuivi prenom={prenom} />}
        {activeTab === 'exercices' && <TabExercices prenom={prenom} />}
        {activeTab === 'planning'  && <TabPlanning prenom={prenom} />}
        {activeTab === 'profs'     && (
          <TabProfs
            prenom={prenom}
            classe={classe}
            profsConfigures={profsConfigures}
            onProfsChange={setProfsConfigures}
          />
        )}
      </div>
    </div>
  )
}

// ─── Tab Suivi ────────────────────────────────────────────────────────────────

function TabSuivi({ prenom }: { prenom: string }) {
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
      <div className="text-4xl mb-3">📭</div>
      <p>Aucune session pour le moment.</p>
      <p className="text-sm mt-1">Lance une session depuis Claude.ai !</p>
    </div>
  )

  // ── Groupement par matière ──────────────────────────────────────────────────
  const parMatiere = sessions.reduce<Record<string, SessionAvecStats[]>>((acc, s) => {
    if (!acc[s.matiere]) acc[s.matiere] = []
    acc[s.matiere].push(s)
    return acc
  }, {})

  // Stats globales (pour les 3 cartes du haut)
  const totalValides = sessions.filter(s => s.statut === 'validé').length
  const totalQcm     = sessions.reduce((a, s) => a + s.qcm_total, 0)
  const totalJuste   = sessions.reduce((a, s) => a + s.qcm_juste, 0)
  const pctReussite  = totalQcm > 0 ? Math.round(totalJuste / totalQcm * 100) : null

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

      {/* Accordéon par matière */}
      <div className="space-y-2">
        {Object.entries(parMatiere).map(([matiere, sessMat]) => {
          const icone     = ICONES_MATIERE[matiere] || '📚'
          const ouvert    = ouverteMat === matiere
          const qcmTotal  = sessMat.reduce((a, s) => a + s.qcm_total, 0)
          const qcmJuste  = sessMat.reduce((a, s) => a + s.qcm_juste, 0)
          const pct       = qcmTotal > 0 ? Math.round(qcmJuste / qcmTotal * 100) : null
          const derniere  = new Date(sessMat[0].created_at).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short',
          })

          return (
            <div key={matiere} className="rounded-xl overflow-hidden"
              style={{ background: 'white', border: '1px solid var(--border)' }}>

              {/* En-tête matière — cliquable */}
              <button
                onClick={() => setOuverteMat(ouvert ? null : matiere)}
                className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icone}</span>
                  <div>
                    <div className="font-medium text-sm">{matiere}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {sessMat.length} session{sessMat.length > 1 ? 's' : ''} · dernière le {derniere}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {/* Taux de réussite */}
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

              {/* Liste des sessions de cette matière */}
              {ouvert && (
                <div className="border-t px-4 pb-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="space-y-2 mt-3">
                    {sessMat.map(s => {
                      const statut    = STATUT_CONFIG[s.statut] || STATUT_CONFIG['en_attente']
                      const score     = s.qcm_total > 0 ? `${s.qcm_juste}/${s.qcm_total}` : null
                      const date      = new Date(s.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short',
                      })
                      const typeLabel = s.type_evaluation === 'ds'
                        ? '📝 DS'
                        : s.type_evaluation === 'brevet_blanc'
                          ? '🏆 BB'
                          : null

                      return (
                        <div key={s.id} className="flex items-center justify-between gap-3 py-2"
                          style={{ borderBottom: '1px solid var(--border)' }}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{date}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: statut.bg, color: statut.color }}>
                                {statut.label}
                              </span>
                              {typeLabel && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full"
                                  style={{ background: 'var(--border)', color: 'var(--muted-foreground)' }}>
                                  {typeLabel}
                                </span>
                              )}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                              {s.chapitre}
                              {score && <span className="ml-2 font-medium" style={{ color: '#2d7a4f' }}>· {score} QCM</span>}
                            </p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            {(s.statut === 'fait' || s.statut === 'validé') && (
                              <Link href={`/session/${s.id}`}
                                className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                                style={{ background: 'var(--primary)', color: 'white' }}>
                                📝
                              </Link>
                            )}
                            <Link href={`/session/${s.id}?mode=parent`}
                              className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                              style={{ background: 'var(--border)', color: 'var(--foreground)' }}>
                              📋
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Tab Exercices ────────────────────────────────────────────────────────────

function TabExercices({ prenom }: { prenom: string }) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/enfant/${encodeURIComponent(prenom)}`

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-6 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
        <div className="text-5xl mb-4">📚</div>
        <h2 className="text-lg font-medium mb-2">Espace de {prenom}</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
          Cet espace est destiné à {prenom} pour faire ses exercices.
          Ouvre-le sur le téléphone ou la tablette de ton enfant.
        </p>
        <a
          href={`/enfant/${encodeURIComponent(prenom)}`}
          className="inline-block px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)' }}
        >
          🎓 Ouvrir les exercices de {prenom}
        </a>
      </div>

      {/* URL à partager */}
      <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid var(--border)' }}>
        <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>
          Lien à partager avec {prenom}
        </p>
        <p className="text-xs font-mono break-all" style={{ color: 'var(--primary)' }}>
          {url}
        </p>
      </div>
    </div>
  )
}

// ─── Tab Planning ─────────────────────────────────────────────────────────────

function TabPlanning({ prenom }: { prenom: string }) {
  return (
    <div className="rounded-2xl p-6 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
      <div className="text-5xl mb-4">📅</div>
      <h2 className="text-lg font-medium mb-2">Planning de {prenom}</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
        Consulte le planning de révision hebdomadaire généré par le Coach IA.
      </p>
      <a
        href={`/planning/${encodeURIComponent(prenom)}`}
        className="inline-block px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--primary)' }}
      >
        📅 Voir le planning
      </a>
    </div>
  )
}

// ─── Tab Profs ────────────────────────────────────────────────────────────────

function TabProfs({
  prenom, classe, profsConfigures, onProfsChange,
}: {
  prenom: string
  classe: string
  profsConfigures: string[]
  onProfsChange: (profs: string[]) => void
}) {
  const [professeurs, setProfesseurs]   = useState<Professeur[]>([])
  const [loading, setLoading]           = useState(true)
  const [avertissement, setAvertissement] = useState<string | null>(null)
  const [expanded, setExpanded]         = useState<string | null>(null)
  const [copie, setCopie]               = useState<string | null>(null)
  const [saving, setSaving]             = useState<string | null>(null)

  const chargerProfs = useCallback(async () => {
    if (!classe) return
    setLoading(true)
    try {
      const res  = await fetch(
        `https://mcp.parentsai.eu/api/professeurs?enfant=${encodeURIComponent(prenom)}&classe=${encodeURIComponent(classe)}`
      )
      const json = await res.json()
      setProfesseurs(json.professeurs || [])
      setAvertissement(json.avertissement || null)
    } catch { /* silencieux */ }
    setLoading(false)
  }, [prenom, classe])

  useEffect(() => { chargerProfs() }, [chargerProfs])

  async function marquerConfigure(matiere: string) {
    const dejaConfigures = profsConfigures.includes(matiere)
    const action = dejaConfigures ? 'remove' : 'add'
    setSaving(matiere)
    try {
      const res  = await fetch('https://mcp.parentsai.eu/api/famille/profs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enfant: prenom, matiere, action }),
      })
      const json = await res.json()
      if (json.succes) onProfsChange(json.profs_configures)
    } catch { /* silencieux */ }
    setSaving(null)
  }

  function copierTemplate(template: string, matiere: string) {
    navigator.clipboard.writeText(template)
    setCopie(matiere)
    // Marque automatiquement comme configuré au moment de la copie
    if (!profsConfigures.includes(matiere)) {
      marquerConfigure(matiere)
    }
    setTimeout(() => setCopie(null), 2000)
  }

  if (loading) return (
    <div className="text-center py-16">
      <div className="text-3xl animate-pulse">⏳</div>
    </div>
  )

  const nbConfigures = profsConfigures.length
  const nbTotal      = professeurs.length

  return (
    <div>
      {/* Titre + progression */}
      <div className="mb-5">
        <h2 className="text-lg font-medium mb-1">Professeurs Claude.ai</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Pour chaque matière, crée un projet Claude.ai et colle les instructions.
        </p>

        {nbTotal > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${(nbConfigures / nbTotal) * 100}%`, background: '#2d7a4f' }}
              />
            </div>
            <span className="text-xs font-medium whitespace-nowrap">
              {nbConfigures} / {nbTotal} configurés
            </span>
          </div>
        )}
      </div>

      {/* Avertissement niveau manquant */}
      {avertissement && (
        <div className="rounded-xl p-3 mb-4 text-sm"
          style={{ background: '#fdf0ed', border: '1px solid #f0c4b8', color: '#c9543a' }}>
          ⚠️ {avertissement}
        </div>
      )}

      {/* Lien Claude.ai global */}
      <a
        href="https://claude.ai/projects"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full rounded-xl px-4 py-3 mb-4 text-sm font-medium transition-opacity hover:opacity-80"
        style={{ background: 'var(--primary)', color: 'white' }}
      >
        <span>🤖 Ouvrir Claude.ai → Mes projets</span>
        <span>↗</span>
      </a>

      {/* Liste des professeurs */}
      <div className="space-y-2">
        {professeurs.map(p => {
          const configure = profsConfigures.includes(p.matiere)
          const ouvert    = expanded === p.matiere
          const icone     = ICONES_MATIERE[p.matiere] || '📚'

          return (
            <div
              key={p.matiere}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'white',
                border: `1px solid ${configure ? '#2d7a4f' : 'var(--border)'}`,
              }}
            >
              {/* En-tête cliquable */}
              <button
                onClick={() => setExpanded(ouvert ? null : p.matiere)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{icone}</span>
                  <div>
                    <div className="font-medium text-sm">{p.matiere}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {p.niveau}
                      {configure && ' · ✅ Configuré'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {configure && <span className="text-xs font-medium" style={{ color: '#2d7a4f' }}>✓</span>}
                  <span style={{ color: 'var(--muted-foreground)', transform: ouvert ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>⌄</span>
                </div>
              </button>

              {/* Contenu déplié */}
              {ouvert && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs mt-3 mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    Nom suggéré du projet Claude : <em className="font-mono">{p.nom_projet}</em>
                  </p>

                  {/* Template */}
                  <pre className="text-xs rounded-lg p-3 overflow-x-auto mb-3"
                    style={{ background: 'var(--background)', color: 'var(--muted-foreground)', whiteSpace: 'pre-wrap' }}>
                    {p.template}
                  </pre>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => copierTemplate(p.template, p.matiere)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: copie === p.matiere ? '#edf7f1' : 'var(--primary)',
                        color:      copie === p.matiere ? '#2d7a4f' : 'white',
                      }}
                    >
                      {copie === p.matiere ? '✓ Copié !' : '📋 Copier les instructions'}
                    </button>
                    <button
                      onClick={() => marquerConfigure(p.matiere)}
                      disabled={saving === p.matiere}
                      className="px-3 py-2 rounded-lg text-sm transition-all"
                      style={{
                        background: configure ? '#edf7f1' : 'var(--background)',
                        color:      configure ? '#2d7a4f' : 'var(--muted-foreground)',
                        border:     '1px solid var(--border)',
                      }}
                      title={configure ? 'Marquer comme non configuré' : 'Marquer comme configuré'}
                    >
                      {saving === p.matiere ? '…' : configure ? '✅' : '○'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-xl p-4 text-sm" style={{ background: '#eef1f5', color: '#2e3b4e' }}>
        <p className="font-medium mb-2">Comment faire :</p>
        <ol className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <li>1. Clique sur une matière → Copier les instructions</li>
          <li>2. Ouvre Claude.ai → Mes projets → Nouveau projet</li>
          <li>3. Nomme-le (ex : <em>Prof Maths 3ème — Assia</em>)</li>
          <li>4. Colle les instructions dans "Instructions du projet"</li>
          <li>5. Connecte le MCP ParentsAI au projet</li>
        </ol>
      </div>
    </div>
  )
}
