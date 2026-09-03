'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { BarChart2, QrCode, Settings, ChevronDown, ChevronUp, Copy, Check, ExternalLink, FileText, Trash2, LineChart, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { normaliserPrenom } from '@/lib/normaliser'
import { supabase } from '@/lib/supabase'
import { AppHeader } from '@/components/ui/AppHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { grouperParType, useSousOuvertes, SousCategorieAccordeon } from '@/components/ui/SousCategorie'
import { SelecteurSemaine } from '@/components/ui/SelecteurSemaine'
import { lundiCourant, dansLaSemaine } from '@/lib/semaine'
import { Session, Reponse, SessionAvecStats } from '@/types'

// ─── Types locaux ──────────────────────────────────────────────────────────────

type Tab = 'suivi' | 'exercices' | 'profs' | 'fiches' | 'progression'

interface Professeur {
  matiere: string
  niveau: string
  template: string
  nom_projet: string
}

const ICONES_MATIERE: Record<string, string> = {
  'Sciences et Technologie': '🔬', 'Sciences Économiques et Sociales': '📊', 'Sciences Numériques et Technologie': '💻',
  'Mathématiques': '🔢', 'Français': '📖', 'Physique-Chimie': '🧪',
  'SVT': '🌱', 'Technologie': '⚙️', 'Histoire-Géographie-EMC': '🌍',
  'Anglais': '🇬🇧', 'Espagnol': '🇪🇸', 'Allemand': '🇩🇪', 'Coach': '🧭',
}

const COULEURS_MATIERE: Record<string, string> = {
  'Sciences et Technologie': '#17A398', 'Sciences Économiques et Sociales': '#7C4DB0', 'Sciences Numériques et Technologie': '#D46A2E',
  'Mathématiques': '#3B7DD9', 'Français': '#2E7D6B', 'Physique-Chimie': '#5BA491',
  'SVT': '#1F5A4D', 'Technologie': '#B8881F', 'Histoire-Géographie-EMC': '#E8B53A',
  'Anglais': '#3B7DD9', 'Espagnol': '#E2685C', 'Allemand': '#6E827B', 'Coach': '#2E7D6B',
}

function normaliserMatiere(m: string): string {
  const map: Record<string, string> = {
    'Maths': 'Mathématiques', 'Math': 'Mathématiques',
    'maths': 'Mathématiques', 'math': 'Mathématiques',
  }
  return map[m] ?? m
}

function statutToVariant(statut: string): 'nonfait' | 'fait' | 'valide' | 'enattente' {
  if (statut === 'validé')    return 'valide'
  if (statut === 'fait')      return 'fait'
  if (statut === 'en_attente') return 'enattente'
  return 'nonfait'
}

// Supprime une session (exercices/DS/brevet/fiche) via le MCP. Réservé aux vues parent.
async function supprimerSessionMcp(id: string): Promise<boolean> {
  try {
    await fetch('https://mcp.parentsai.eu/api/session/supprimer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: id }),
    })
    return true
  } catch { return false }
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'profs',       label: 'Profs',       Icon: Settings },
  { id: 'suivi',       label: 'Suivi',       Icon: BarChart2 },
  { id: 'progression', label: 'Progression', Icon: LineChart },
  { id: 'fiches',      label: 'Fiches',      Icon: FileText },
  { id: 'exercices',   label: 'Vue enfant',  Icon: QrCode },
]

// ─── Composant principal ───────────────────────────────────────────────────────

export default function EspaceEnfant() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const prenom       = normaliserPrenom(decodeURIComponent(params.prenom as string))
  const activeTab    = (searchParams.get('tab') as Tab) || 'suivi'

  const [classe, setClasse] = useState('')
  const [profsConfigures, setProfsConfigures] = useState<string[]>([])
  const [toutes, setToutes] = useState<{ enfant: string; classe?: string }[]>([])
  const [familleId, setFamilleId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    async function chargerFamille() {
      // Lecture directe : la RLS Supabase ne renvoie que les familles du parent connecté
      const { data } = await supabase
        .from('familles')
        .select('id, enfant, classe, profs_configures, access_token')
        .order('enfant')
      const familles = data || []
      setToutes(familles)
      const famille = familles.find(
        (f: { id: string; enfant: string; classe: string; profs_configures: string[] }) =>
          f.enfant.toLowerCase() === prenom.toLowerCase()
      )
      if (famille) {
        setClasse(famille.classe || '')
        setProfsConfigures(famille.profs_configures || [])
        // Identifiant unique de la famille : isole les sessions même en cas d'homonymes
        setFamilleId(famille.id)
        setAccessToken(famille.access_token || null)
      }
    }
    chargerFamille()
  }, [prenom])

  function setTab(tab: Tab) {
    router.push(`/espace/${encodeURIComponent(prenom)}?tab=${tab}`)
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F7F8FA' }}>

      <AppHeader prenom={prenom} classe={classe} familles={toutes} />

      {/* ── Contenu ── */}
      <div className="max-w-app mx-auto px-4 py-5">
        {activeTab === 'suivi'       && <TabSuivi prenom={prenom} classe={classe} familleId={familleId} />}
        {activeTab === 'progression' && <TabProgression prenom={prenom} familleId={familleId} />}
        {activeTab === 'fiches'      && <TabFiches prenom={prenom} familleId={familleId} />}
        {activeTab === 'exercices' && <TabExercices prenom={prenom} />}
        {activeTab === 'profs'     && (
          <TabProfs
            prenom={prenom}
            classe={classe}
            token={accessToken}
            familleId={familleId}
            profsConfigures={profsConfigures}
            onProfsChange={setProfsConfigures}
          />
        )}
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
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1.5 transition-colors"
              style={{ color: actif ? '#2E7D6B' : '#6E827B' }}
            >
              <Icon size={24} strokeWidth={actif ? 2.5 : 1.8} />
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

// ─── Tab Suivi ────────────────────────────────────────────────────────────────

function LigneSuivi({ s, retourQuery, onSupprimer, onNote }: { s: SessionAvecStats; retourQuery: string; onSupprimer: (id: string) => void; onNote: (s: SessionAvecStats) => void }) {
  const score = s.qcm_total > 0 ? `${s.qcm_juste}/${s.qcm_total}` : null
  const date  = new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  return (
    <div
      className="flex items-center justify-between gap-3 py-2.5"
      style={{ borderBottom: '1px solid #F0F1F3' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: '#6E827B' }}>{date}</span>
          <StatusBadge variant={statutToVariant(s.statut)} />
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#6E827B' }}>
          {s.chapitre}
          {score && <span className="ml-2 font-semibold" style={{ color: '#1F5A4D' }}>· {score} QCM</span>}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {(s.statut === 'fait' || s.statut === 'validé') && (
          <Link
            href={`/session/${s.id}?${retourQuery}`}
            className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
            style={{ background: '#2E7D6B', color: '#fff' }}
          >
            Enfant
          </Link>
        )}
        <Link
          href={`/session/${s.id}?mode=parent&${retourQuery}`}
          className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
          style={{ background: '#E3F0EC', color: '#1F5A4D' }}
        >
          Corrigé
        </Link>
        <button
          onClick={() => onNote(s)}
          className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
          style={{ background: s.correction_json ? '#FDF8EA' : '#F3F6F5', color: s.correction_json ? '#B8881F' : '#6E827B' }}
        >
          {s.correction_json ? `${s.correction_json.note}/${s.correction_json.note_sur || 20}` : 'Note'}
        </button>
        <button
          onClick={() => onSupprimer(s.id)}
          className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg transition-opacity hover:opacity-80"
          style={{ background: '#FBE6E3', color: '#A32D2D' }}
          aria-label="Supprimer"
          title="Supprimer"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

function ModaleNote({ session, onClose }: { session: SessionAvecStats; onClose: () => void }) {
  const c = session.correction_json
  const [copie, setCopie] = useState(false)

  // Wording prêt à coller dans Claude : la date d'abord (repère simple), puis le
  // thème entre guillemets pour lever toute ambiguïté si plusieurs sessions le même jour.
  const dateFr = new Date(session.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  const demande = `Corrige la session du ${dateFr} « ${session.chapitre} » de ${session.enfant}`

  function copierDemande() {
    navigator.clipboard.writeText(demande)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#fff', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#2E7D6B' }}>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{session.matiere}</p>
            <p className="text-white/70 text-xs truncate">{session.chapitre}</p>
          </div>
          <button onClick={onClose} className="text-white text-2xl leading-none px-2" aria-label="Fermer">×</button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 62px)' }}>
          {!c ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">📝</div>
              <p className="font-bold" style={{ color: '#1E2A26' }}>Pas encore corrigé</p>
              <p className="text-sm mt-2" style={{ color: '#6E827B' }}>
                Dans Claude, demande la correction — ou copie la phrase toute prête :
              </p>
              <div
                className="mt-3 rounded-xl p-3 text-left text-sm"
                style={{ background: '#F4F6F5', color: '#1E2A26', border: '1px solid #E3E7E5' }}
              >
                « {demande} »
              </div>
              <button
                onClick={copierDemande}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: copie ? '#2E7D6B' : '#1E2A26', color: '#fff' }}
              >
                {copie ? <><Check size={15} /> Copié !</> : <><Copy size={15} /> Copier la demande</>}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <div className="text-3xl font-extrabold" style={{ color: '#B8881F' }}>{c.note}/{c.note_sur || 20}</div>
                <div className="text-xs uppercase tracking-wide" style={{ color: '#6E827B' }}>Note</div>
              </div>
              {c.appreciation && (
                <div className="rounded-xl p-3 mb-4 text-sm leading-relaxed" style={{ background: '#E3F0EC', color: '#1F5A4D' }}>
                  {c.appreciation}
                </div>
              )}
              {(c.commentaires || []).map((cm, i) => (
                <div key={i} className="mb-3 pb-3" style={{ borderBottom: '1px solid #F0F1F3' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#2E7D6B' }}>Exercice {cm.exercice}</p>
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: '#1E2A26' }}>{cm.commentaire}</p>
                </div>
              ))}
              {c.corrige_le && <p className="text-xs text-center mt-2" style={{ color: '#9aa8a2' }}>Corrigé par Claude le {c.corrige_le}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function TabSuivi({ prenom, classe, familleId }: { prenom: string; classe: string; familleId: string | null }) {
  const searchParams = useSearchParams()
  const matInit = searchParams.get('mat')
  const catInit = searchParams.get('cat')
  const cleInit = matInit && catInit ? `${matInit}::${catInit}` : undefined

  const [semaineDebut, setSemaineDebut] = useState<string>(searchParams.get('sem') || lundiCourant())
  const [sessions, setSessions] = useState<SessionAvecStats[]>([])
  const [loading, setLoading]   = useState(true)
  const [ouverteMat, setOuverteMat] = useState<string | null>(matInit)
  const [noteVue, setNoteVue]   = useState<SessionAvecStats | null>(null)
  const sous = useSousOuvertes(cleInit ? [cleInit] : [])

  useEffect(() => {
    async function charger() {
      if (!familleId) return
      setLoading(true)
      const { data } = await supabase
        .from('sessions').select('*')
        .eq('famille_id', familleId)
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
  }, [prenom, familleId])

  async function supprimer(id: string) {
    if (!window.confirm('Supprimer définitivement cette session ? Cette action est irréversible.')) return
    await supprimerSessionMcp(id)
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  if (loading) return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: '#6E827B' }}>Chargement...</p>
    </div>
  )

  if (sessions.length === 0) return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">📭</div>
      <p className="font-semibold" style={{ color: '#1E2A26' }}>Aucune session pour le moment.</p>
      <p className="text-sm mt-1" style={{ color: '#6E827B' }}>Lance une session depuis Claude.ai !</p>
    </div>
  )

  const sessionsSemaine = sessions.filter(s => s.type_evaluation !== 'fiche' && dansLaSemaine(s.created_at, semaineDebut))

  const parMatiere = sessionsSemaine.reduce<Record<string, SessionAvecStats[]>>((acc, s) => {
    if (!acc[s.matiere]) acc[s.matiere] = []
    acc[s.matiere].push(s)
    return acc
  }, {})

  const totalValides = sessionsSemaine.filter(s => s.statut === 'validé').length
  const totalQcm     = sessionsSemaine.reduce((a, s) => a + s.qcm_total, 0)
  const totalJuste   = sessionsSemaine.reduce((a, s) => a + s.qcm_juste, 0)
  const pctReussite  = totalQcm > 0 ? Math.round(totalJuste / totalQcm * 100) : null

  return (
    <div>
      <SelecteurSemaine
        semaineDebut={semaineDebut}
        onChange={s => { setSemaineDebut(s); setOuverteMat(null) }}
      />

      {sessionsSemaine.length === 0 ? (
        <div className="text-center py-14">
          <div className="text-5xl mb-4">🗓️</div>
          <p className="font-semibold" style={{ color: '#1E2A26' }}>Aucune session cette semaine</p>
          <p className="text-sm mt-1" style={{ color: '#6E827B' }}>Utilise les flèches pour voir les autres semaines.</p>
        </div>
      ) : (
      <>
      {/* Stat trio */}
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
            <div
              className="text-2xl font-bold"
              style={{ color: stat.label === 'Réussite' && pctReussite !== null ? '#1F5A4D' : '#1E2A26' }}
            >
              {stat.value}
            </div>
            <div className="text-xs mt-0.5 uppercase tracking-wide" style={{ color: '#6E827B', fontSize: 10 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Accordéon par matière */}
      <div className="space-y-2">
        {Object.entries(parMatiere).map(([matiere, sessMat]) => {
          const icone    = ICONES_MATIERE[matiere] || '📚'
          const couleur  = COULEURS_MATIERE[matiere] || '#2E7D6B'
          const ouvert   = ouverteMat === matiere
          const qcmTotal = sessMat.reduce((a, s) => a + s.qcm_total, 0)
          const qcmJuste = sessMat.reduce((a, s) => a + s.qcm_juste, 0)
          const pct      = qcmTotal > 0 ? Math.round(qcmJuste / qcmTotal * 100) : null
          const derniere = new Date(sessMat[0].created_at).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short',
          })

          return (
            <div
              key={matiere}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <button
                onClick={() => setOuverteMat(ouvert ? null : matiere)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  {/* Barre colorée matière */}
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ background: couleur }} />
                  <div>
                    <div className="font-bold text-sm uppercase tracking-wide" style={{ color: '#1E2A26' }}>
                      {matiere}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#6E827B' }}>
                      {sessMat.length} session{sessMat.length > 1 ? 's' : ''} · {derniere}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {pct !== null && (
                    <span className="text-sm font-bold" style={{ color: '#1F5A4D' }}>{pct}%</span>
                  )}
                  {ouvert ? <ChevronUp size={16} style={{ color: '#6E827B' }} /> : <ChevronDown size={16} style={{ color: '#6E827B' }} />}
                </div>
              </button>

              {ouvert && (
                <div className="px-4 pb-3 border-t" style={{ borderColor: '#DCE8E4' }}>
                  {grouperParType(sessMat, classe).map(({ cat, items }) => {
                    const cle = `${matiere}::${cat.id}`
                    const retourQuery = `mat=${encodeURIComponent(matiere)}&cat=${cat.id}`
                    return (
                      <SousCategorieAccordeon
                        key={cat.id}
                        emoji={cat.emoji} label={cat.label} count={items.length}
                        ouvert={sous.estOuverte(cle)} onToggle={() => sous.basculer(cle)}
                      >
                        <div className="space-y-2">
                          {items.map(s => <LigneSuivi key={s.id} s={s} retourQuery={retourQuery} onSupprimer={supprimer} onNote={setNoteVue} />)}
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
      </>
      )}
      {noteVue && <ModaleNote session={noteVue} onClose={() => setNoteVue(null)} />}
    </div>
  )
}

// ─── Tab Exercices ────────────────────────────────────────────────────────────

function TabExercices({ prenom }: { prenom: string }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading]         = useState(true)
  const [copie, setCopie]             = useState(false)

  useEffect(() => {
    async function chargerToken() {
      const { data } = await supabase
        .from('familles')
        .select('access_token')
        .ilike('enfant', prenom)
        .single()
      setAccessToken(data?.access_token || null)
      setLoading(false)
    }
    chargerToken()
  }, [prenom])

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.parentsai.eu'
  const qrUrl  = accessToken
    ? `${origin}/enfant/${encodeURIComponent(prenom)}?t=${accessToken}`
    : null

  function copierLien() {
    if (!qrUrl) return
    navigator.clipboard.writeText(qrUrl)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  if (loading) return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: '#6E827B' }}>Chargement...</p>
    </div>
  )

  if (!accessToken) return (
    <div
      className="rounded-2xl p-6 text-center"
      style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="text-4xl mb-3">⚠️</div>
      <p className="text-sm" style={{ color: '#6E827B' }}>
        Aucun code d'accès trouvé pour {prenom}.<br />
        Reconfigurez la famille dans l'onboarding.
      </p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <p className="font-bold text-base mb-1" style={{ color: '#1E2A26' }}>QR Code de {prenom}</p>
        <p className="text-sm mb-6" style={{ color: '#6E827B' }}>
          Montre ce QR code à {prenom} — il l'ouvre avec son téléphone.
        </p>

        <div
          className="inline-block p-4 rounded-2xl mb-6"
          style={{ background: '#fff', border: '2px solid #DCE8E4' }}
        >
          <QRCode value={qrUrl!} size={200} />
        </div>

        <a
          href={qrUrl!}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90"
          style={{ background: '#2E7D6B' }}
        >
          Ouvrir l'espace de {prenom}
        </a>
      </div>

      <div
        className="rounded-2xl p-4"
        style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <p className="text-xs uppercase tracking-wide mb-2" style={{ color: '#6E827B' }}>Ou partage ce lien</p>
        <div className="flex items-center gap-3">
          <p className="flex-1 text-xs font-mono break-all" style={{ color: '#2E7D6B' }}>{qrUrl}</p>
          <button
            onClick={copierLien}
            className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            style={{
              background: copie ? '#E3F0EC' : '#2E7D6B',
              color: copie ? '#1F5A4D' : '#fff',
            }}
          >
            {copie ? <Check size={14} /> : <Copy size={14} />}
            {copie ? 'Copié' : 'Copier'}
          </button>
        </div>
      </div>
    </div>
  )
}


// ─── Tab Profs ────────────────────────────────────────────────────────────────

function TabProfs({
  prenom, classe, token, familleId, profsConfigures, onProfsChange,
}: {
  prenom: string
  classe: string
  token: string | null
  familleId: string | null
  profsConfigures: string[]
  onProfsChange: (profs: string[]) => void
}) {
  const [professeurs, setProfesseurs]     = useState<Professeur[]>([])
  const [loading, setLoading]             = useState(true)
  const [avertissement, setAvertissement] = useState<string | null>(null)
  const [expanded, setExpanded]           = useState<string | null>(null)
  const [copie, setCopie]                 = useState<string | null>(null)
  const [saving, setSaving]               = useState<string | null>(null)
  const [matieresAvecSession, setMatieresAvecSession] = useState<Set<string>>(new Set())

  const chargerProfs = useCallback(async () => {
    if (!classe) return
    setLoading(true)
    try {
      // On passe le token : le bootstrap injecté dans le projet Claude identifie
      // ainsi l'enfant par son jeton unique (et non par son prénom).
      const params = new URLSearchParams({ enfant: prenom, classe })
      if (token) params.set('token', token)
      const res  = await fetch(`https://mcp.parentsai.eu/api/professeurs?${params.toString()}`)
      const json = await res.json()
      setProfesseurs(json.professeurs || [])
      setAvertissement(json.avertissement || null)
    } catch { /* silencieux */ }
    setLoading(false)
  }, [prenom, classe, token])

  useEffect(() => { chargerProfs() }, [chargerProfs])

  // Une session existante prouve que le prof + le connecteur fonctionnent → configuré d'office
  useEffect(() => {
    if (!familleId) return
    supabase
      .from('sessions').select('matiere').eq('famille_id', familleId)
      .then(({ data }) => {
        if (data) setMatieresAvecSession(
          new Set(data.map((s: { matiere: string }) => normaliserMatiere(s.matiere)))
        )
      })
  }, [familleId])

  async function marquerConfigure(matiere: string) {
    const dejaConfigures = profsConfigures.includes(matiere)
    const action = dejaConfigures ? 'remove' : 'add'
    setSaving(matiere)
    try {
      const res  = await fetch('https://mcp.parentsai.eu/api/famille/profs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, enfant: prenom, matiere, action }),
      })
      const json = await res.json()
      if (json.succes) onProfsChange(json.profs_configures)
    } catch { /* silencieux */ }
    setSaving(null)
  }

  function copierTemplate(template: string, matiere: string) {
    navigator.clipboard.writeText(template)
    setCopie(matiere)
    setTimeout(() => setCopie(null), 2000)
  }

  const MCP_URL = 'https://mcp.parentsai.eu/mcp'
  function copierConnecteur() {
    navigator.clipboard.writeText(MCP_URL)
    setCopie('__mcp')
    setTimeout(() => setCopie(null), 2000)
  }

  if (loading) return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: '#6E827B' }}>Chargement...</p>
    </div>
  )

  // Configuré = le parent l'a coché manuellement OU une session existe déjà dans la matière
  const estConfigure = (matiere: string) =>
    profsConfigures.includes(matiere) || matieresAvecSession.has(matiere)

  const nbTotal      = professeurs.length
  const nbConfigures = professeurs.filter(p => estConfigure(p.matiere)).length

  return (
    <div>
      {/* En-tête + progression */}
      <div className="mb-5">
        <p className="font-bold text-base mb-1" style={{ color: '#1E2A26' }}>Professeurs Claude.ai</p>
        <p className="text-sm mb-3" style={{ color: '#6E827B' }}>
          Crée un projet Claude.ai par matière et colle les instructions.
        </p>
        {nbTotal > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#E3F0EC' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(nbConfigures / nbTotal) * 100}%`, background: '#2E7D6B' }}
              />
            </div>
            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: '#1E2A26' }}>
              {nbConfigures} / {nbTotal}
            </span>
          </div>
        )}
      </div>

      {/* Mode d'emploi en 2 étapes — tout en haut */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: '#E3F0EC', border: '1px solid #C2DED6' }}>
        <p className="font-bold text-sm mb-3" style={{ color: '#1F5A4D' }}>Comment installer vos profs</p>

        {/* Étape 1 : le connecteur */}
        <div className="mb-4">
          <p className="text-sm font-bold mb-1" style={{ color: '#1F5A4D' }}>
            1. Branchez le connecteur IAla <span className="font-normal">(une seule fois)</span>
          </p>
          <p className="text-xs mb-2 leading-relaxed" style={{ color: '#1F5A4D' }}>
            📱 Depuis le <strong>téléphone</strong> (ou l'ordinateur, au choix).
            Dans l'app <strong>Claude</strong> → <strong>Paramètres</strong> → <strong>Connecteurs</strong> → <strong>Ajouter</strong>
            {' '}(ou sur <strong>claude.ai</strong> → <strong>Personnaliser</strong> → <strong>Connecteurs</strong>),
            collez cette adresse et nommez-le <strong>IAla</strong> :
          </p>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#fff', border: '1px solid #C2DED6' }}>
            <code className="flex-1 text-xs font-mono break-all" style={{ color: '#2E7D6B' }}>{MCP_URL}</code>
            <button
              onClick={copierConnecteur}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              style={{
                background: copie === '__mcp' ? '#C2DED6' : '#2E7D6B',
                color:      copie === '__mcp' ? '#1F5A4D' : '#fff',
              }}
            >
              {copie === '__mcp' ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier</>}
            </button>
          </div>
          <p className="text-xs mt-2 leading-relaxed rounded-lg p-2" style={{ color: '#1F5A4D', background: '#FDF8EA', border: '1px solid #EAD8A0' }}>
            ✅ <strong>À ne pas rater :</strong> ouvrez ensuite le connecteur IAla → <strong>« Tous les outils »</strong> → <strong>« Toujours autoriser »</strong> — sinon Claude redemande la permission à chaque exercice.
          </p>
          <a
            href="/guide-connecteur"
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
            style={{ background: '#fff', color: '#2E7D6B', border: '1.5px solid #2E7D6B' }}
          >
            📖 Voir le guide en images
          </a>
        </div>

        {/* Étape 2 : les profs */}
        <div>
          <p className="text-sm font-bold mb-1" style={{ color: '#1F5A4D' }}>2. Créez un prof par matière</p>
          <ol className="space-y-1 text-xs leading-relaxed" style={{ color: '#1F5A4D' }}>
            <li>① Choisissez une matière ci-dessous → <strong>Copier les instructions</strong></li>
            <li>② Sur Claude.ai → Mes projets → <strong>Nouveau projet</strong></li>
            <li>③ Collez les instructions dans « Instructions du projet »</li>
          </ol>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: '#2E7D6B' }}>
            💡 Tout se fait depuis le <strong>téléphone</strong> : le connecteur, la création des profs et l'usage au quotidien.
          </p>
        </div>

        {/* Étape 3 : une fois les profs prêts */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #C2DED6' }}>
          <p className="text-sm font-bold mb-1" style={{ color: '#1F5A4D' }}>3. Une fois vos profs prêts, demandez dans Claude</p>
          <ul className="space-y-1 text-xs leading-relaxed" style={{ color: '#1F5A4D' }}>
            <li>« <strong>Session [chapitre]</strong> » → des exercices</li>
            <li>« <strong>DS [chapitre]</strong> » → un devoir surveillé</li>
            <li>« <strong>Brevet blanc</strong> » → un examen blanc</li>
            <li>« <strong>Fiche de révision [chapitre]</strong> » → une fiche imprimable</li>
            <li>« <strong>Corrige la session de {prenom}</strong> » → une note + des commentaires</li>
          </ul>
          <p className="text-xs mt-2 font-semibold" style={{ color: '#2E7D6B' }}>
            ➡️ Tout s'affiche automatiquement dans IAla : Suivi, Fiches, Progression et Notes.
          </p>
        </div>
      </div>

      {/* Allez, on crée les profs ! */}
      <p className="font-bold text-base mb-3" style={{ color: '#1E2A26' }}>Allez, on crée les profs !</p>

      {/* Avertissement */}
      {avertissement && (
        <div
          className="rounded-xl p-3 mb-4 text-sm"
          style={{ background: '#FBE6E3', border: '1px solid #F7CFC9', color: '#D9483B' }}
        >
          ⚠️ {avertissement}
        </div>
      )}

      {/* Lien Claude.ai */}
      <a
        href="https://claude.ai/projects"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full rounded-xl px-4 py-3 mb-4 text-sm font-bold transition-opacity hover:opacity-90"
        style={{ background: '#2E7D6B', color: '#fff' }}
      >
        <span>Ouvrir Claude.ai → Mes projets</span>
        <ExternalLink size={16} />
      </a>

      {/* Liste professeurs */}
      <div className="space-y-2">
        {professeurs.map(p => {
          const aSession  = matieresAvecSession.has(p.matiere)
          const configure = estConfigure(p.matiere)
          const ouvert    = expanded === p.matiere
          const icone     = ICONES_MATIERE[p.matiere] || '📚'
          const couleur   = COULEURS_MATIERE[p.matiere] || '#2E7D6B'

          return (
            <div
              key={p.matiere}
              className="rounded-2xl overflow-hidden"
              style={{
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                border: `1.5px solid ${configure ? '#2E7D6B' : '#DCE8E4'}`,
              }}
            >
              <button
                onClick={() => setExpanded(ouvert ? null : p.matiere)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ background: couleur }} />
                  <div>
                    <div className="font-bold text-sm uppercase tracking-wide" style={{ color: '#1E2A26' }}>
                      {icone} {p.matiere}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#6E827B' }}>
                      {p.niveau}{aSession ? ' · ✅ Actif' : (configure ? ' · ✅ Configuré' : '')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {configure && <span className="text-xs font-bold" style={{ color: '#2E7D6B' }}>✓</span>}
                  {ouvert ? <ChevronUp size={16} style={{ color: '#6E827B' }} /> : <ChevronDown size={16} style={{ color: '#6E827B' }} />}
                </div>
              </button>

              {ouvert && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: '#DCE8E4' }}>
                  <p className="text-xs mt-3 mb-2" style={{ color: '#6E827B' }}>
                    Nom suggéré : <em className="font-mono">{p.nom_projet}</em>
                  </p>
                  <pre
                    className="text-xs rounded-xl p-3 overflow-x-auto mb-3"
                    style={{ background: '#F7F8FA', color: '#6E827B', whiteSpace: 'pre-wrap' }}
                  >
                    {p.template}
                  </pre>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copierTemplate(p.template, p.matiere)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: copie === p.matiere ? '#E3F0EC' : '#2E7D6B',
                        color:      copie === p.matiere ? '#1F5A4D' : '#fff',
                      }}
                    >
                      {copie === p.matiere ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Copier les instructions</>}
                    </button>
                    {aSession ? (
                      <span
                        className="px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        style={{ background: '#E3F0EC', color: '#1F5A4D', border: '1.5px solid #C2DED6' }}
                        title="Une session a déjà été lancée dans cette matière"
                      >
                        ✅ Actif
                      </span>
                    ) : (
                      <button
                        onClick={() => marquerConfigure(p.matiere)}
                        disabled={saving === p.matiere}
                        className="px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          background: configure ? '#E3F0EC' : '#F7F8FA',
                          color:      configure ? '#1F5A4D' : '#6E827B',
                          border:     '1.5px solid #DCE8E4',
                        }}
                        title={configure ? 'Marquer comme non configuré' : 'Marquer comme déjà configuré'}
                      >
                        {saving === p.matiere ? '…' : configure ? '✅' : '○'}
                      </button>
                    )}
                  </div>
                  {!aSession && (
                    <p className="text-xs mt-2" style={{ color: '#6E827B' }}>
                      ○ → ✅ si tu l&apos;as déjà configuré. Sinon, ça se fera tout seul dès la première session.
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}

// ─── Tab Fiches de révision ─────────────────────────────────────────────────────

function TabFiches({ prenom, familleId }: { prenom: string; familleId: string | null }) {
  const [fiches, setFiches]       = useState<Session[]>([])
  const [loading, setLoading]     = useState(true)
  const [ouverteMat, setOuverteMat] = useState<string | null>(null)

  useEffect(() => {
    async function charger() {
      if (!familleId) return
      setLoading(true)
      const { data } = await supabase
        .from('sessions').select('*')
        .eq('famille_id', familleId)
        .eq('type_evaluation', 'fiche')
        .order('created_at', { ascending: false })
      setFiches(((data || []) as Session[]).map(s => ({ ...s, matiere: normaliserMatiere(s.matiere) })))
      setLoading(false)
    }
    charger()
  }, [prenom, familleId])

  async function supprimer(id: string) {
    if (!window.confirm('Supprimer définitivement cette fiche ? Cette action est irréversible.')) return
    await supprimerSessionMcp(id)
    setFiches(prev => prev.filter(f => f.id !== id))
  }

  if (loading) return (
    <div className="text-center py-16"><p className="text-sm" style={{ color: '#6E827B' }}>Chargement...</p></div>
  )

  if (fiches.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">📒</div>
      <p className="font-bold" style={{ color: '#1E2A26' }}>Aucune fiche pour le moment.</p>
      <p className="text-sm mt-2" style={{ color: '#6E827B' }}>Demande une « fiche de révision [chapitre] » à un prof Claude.</p>
    </div>
  )

  const parMatiere = fiches.reduce<Record<string, Session[]>>((acc, f) => {
    if (!acc[f.matiere]) acc[f.matiere] = []
    acc[f.matiere].push(f)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-4">
        <p className="font-bold text-base mb-1" style={{ color: '#1E2A26' }}>Fiches de révision</p>
        <p className="text-sm" style={{ color: '#6E827B' }}>À lire et imprimer, gardées par matière.</p>
      </div>

      <div className="space-y-2">
        {Object.entries(parMatiere).map(([matiere, list]) => {
          const couleur = COULEURS_MATIERE[matiere] || '#2E7D6B'
          const icone   = ICONES_MATIERE[matiere] || '📚'
          const ouvert  = ouverteMat === matiere

          return (
            <div key={matiere} className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <button onClick={() => setOuverteMat(ouvert ? null : matiere)} className="w-full px-4 py-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ background: couleur }} />
                  <div>
                    <div className="font-bold text-sm uppercase tracking-wide" style={{ color: '#1E2A26' }}>{icone} {matiere}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#6E827B' }}>{list.length} fiche{list.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
                {ouvert ? <ChevronUp size={16} style={{ color: '#6E827B' }} /> : <ChevronDown size={16} style={{ color: '#6E827B' }} />}
              </button>

              {ouvert && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: '#DCE8E4' }}>
                  <div className="space-y-2 pt-3">
                    {list.map(f => (
                      <div key={f.id} className="flex items-center gap-2">
                        <Link
                          href={`/session/${f.id}`}
                          className="flex-1 flex items-center justify-between p-3 rounded-xl transition-opacity active:opacity-70 min-w-0"
                          style={{ background: '#F7F8FA', border: '1px solid #DCE8E4' }}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#1E2A26' }}>{f.exercices_json?.titre || f.chapitre}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#6E827B' }}>
                              {new Date(f.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                          <span className="text-xs px-3 py-1.5 rounded-xl font-bold shrink-0 ml-2" style={{ background: '#2E7D6B', color: '#fff' }}>Ouvrir →</span>
                        </Link>
                        <button
                          onClick={() => supprimer(f.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0 transition-opacity hover:opacity-80"
                          style={{ background: '#FBE6E3', color: '#A32D2D' }}
                          aria-label="Supprimer" title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
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

// ─── Tab Progression (bilan de l'année) ─────────────────────────────────────────

function TabProgression({ prenom, familleId }: { prenom: string; familleId: string | null }) {
  const [sessions, setSessions] = useState<SessionAvecStats[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function charger() {
      if (!familleId) return
      setLoading(true)
      const { data: sess } = await supabase
        .from('sessions').select('*')
        .eq('famille_id', familleId)
        .order('created_at', { ascending: true })
      const liste = ((sess || []) as Session[]).filter(s => s.type_evaluation !== 'fiche')
      const ids = liste.map(s => s.id)
      let reps: Reponse[] = []
      if (ids.length) {
        const { data } = await supabase.from('reponses').select('*').in('session_id', ids)
        reps = (data || []) as Reponse[]
      }
      const avec: SessionAvecStats[] = liste.map(s => {
        const r = reps.filter(x => x.session_id === s.id)
        return {
          ...s,
          matiere: normaliserMatiere(s.matiere),
          qcm_total: r.filter(x => x.type === 'qcm').length,
          qcm_juste: r.filter(x => x.type === 'qcm' && x.est_correct).length,
          pb_termine: r.filter(x => x.type === 'probleme' && x.est_termine).length,
        }
      })
      setSessions(avec)
      setLoading(false)
    }
    charger()
  }, [prenom, familleId])

  if (loading) return (
    <div className="text-center py-16"><p className="text-sm" style={{ color: '#6E827B' }}>Chargement...</p></div>
  )

  if (sessions.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">📈</div>
      <p className="font-bold" style={{ color: '#1E2A26' }}>Pas encore de progression.</p>
      <p className="text-sm mt-2" style={{ color: '#6E827B' }}>Les sessions et les scores apparaîtront ici au fil de l&apos;année.</p>
    </div>
  )

  const total    = sessions.length
  const validees = sessions.filter(s => s.statut === 'validé').length
  const qcmT     = sessions.reduce((a, s) => a + s.qcm_total, 0)
  const qcmJ     = sessions.reduce((a, s) => a + s.qcm_juste, 0)
  const reussite = qcmT > 0 ? Math.round(qcmJ / qcmT * 100) : null
  const depuis   = new Date(sessions[0].created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const noteSur20 = (s: SessionAvecStats) =>
    s.correction_json && typeof s.correction_json.note === 'number'
      ? s.correction_json.note / (s.correction_json.note_sur || 20) * 20
      : null
  const notes   = sessions.map(noteSur20).filter((n): n is number => n !== null)
  const moyenne = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : null

  // Regroupement par matière + tendance QCM (récent vs ancien)
  const parMat = Object.entries(
    sessions.reduce<Record<string, SessionAvecStats[]>>((acc, s) => {
      if (!acc[s.matiere]) acc[s.matiere] = []
      acc[s.matiere].push(s)
      return acc
    }, {})
  ).map(([matiere, list]) => {
    const qt  = list.reduce((a, s) => a + s.qcm_total, 0)
    const qj  = list.reduce((a, s) => a + s.qcm_juste, 0)
    const pct = qt > 0 ? Math.round(qj / qt * 100) : null
    let tendance: 'up' | 'down' | 'flat' | null = null
    const avecQcm = list.filter(s => s.qcm_total > 0)
    if (avecQcm.length >= 2) {
      const m = Math.floor(avecQcm.length / 2)
      const p = (arr: SessionAvecStats[]) => {
        const t = arr.reduce((a, s) => a + s.qcm_total, 0)
        const j = arr.reduce((a, s) => a + s.qcm_juste, 0)
        return t > 0 ? j / t * 100 : 0
      }
      const anc = p(avecQcm.slice(0, m))
      const rec = p(avecQcm.slice(m))
      tendance = rec > anc + 5 ? 'up' : rec < anc - 5 ? 'down' : 'flat'
    }
    const notesM = list.map(noteSur20).filter((n): n is number => n !== null)
    const moy = notesM.length ? notesM.reduce((a, b) => a + b, 0) / notesM.length : null
    return { matiere, count: list.length, pct, tendance, moy }
  }).sort((a, b) => b.count - a.count)

  // Sessions par mois (8 derniers présents)
  const moisMap = sessions.reduce<Record<string, number>>((acc, s) => {
    const k = s.created_at.slice(0, 7)
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
  const mois = Object.keys(moisMap).sort().slice(-8).map(k => ({
    label: new Date(k + '-01').toLocaleDateString('fr-FR', { month: 'short' }),
    count: moisMap[k],
  }))
  const maxMois = Math.max(1, ...mois.map(m => m.count))

  return (
    <div>
      <p className="text-sm mb-4" style={{ color: '#6E827B' }}>Depuis {depuis}</p>

      {/* Chiffres clés */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {[
          { v: String(total),    l: 'Sessions',     c: '#1E2A26', bg: '#F3F6F5' },
          { v: String(validees), l: 'Validées',     c: '#1F5A4D', bg: '#F3F6F5' },
          { v: reussite !== null ? `${reussite} %` : '—', l: 'Réussite QCM', c: '#3B7DD9', bg: '#F3F6F5' },
          { v: moyenne !== null ? moyenne.toFixed(1).replace('.', ',') : '—', l: 'Moyenne /20', c: '#B8881F', bg: '#FDF8EA' },
        ].map(card => (
          <div key={card.l} className="rounded-xl p-3" style={{ background: card.bg }}>
            <div className="text-2xl font-bold" style={{ color: card.c }}>{card.v}</div>
            <div className="uppercase" style={{ color: '#6E827B', fontSize: 10, letterSpacing: '0.03em' }}>{card.l}</div>
          </div>
        ))}
      </div>

      {/* Par matière */}
      <p className="font-bold text-sm mb-2" style={{ color: '#1E2A26' }}>Par matière</p>
      <div className="space-y-2 mb-6">
        {parMat.map(m => {
          const couleur = COULEURS_MATIERE[m.matiere] || '#2E7D6B'
          return (
            <div key={m.matiere} className="flex items-center gap-3 rounded-xl p-3" style={{ background: '#fff', border: '1px solid #ECEFED' }}>
              <div className="w-1 rounded-full shrink-0" style={{ height: 34, background: couleur }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#1E2A26' }}>{m.matiere}</p>
                <p className="text-xs" style={{ color: '#6E827B' }}>
                  {m.count} session{m.count > 1 ? 's' : ''}{m.pct !== null ? ` · ${m.pct} % QCM` : ''}
                </p>
              </div>
              {m.moy !== null && (
                <span className="text-sm font-bold shrink-0" style={{ color: '#B8881F' }}>
                  {m.moy.toFixed(1).replace('.', ',')}/20
                </span>
              )}
              {m.tendance === 'up'   && <TrendingUp size={18} style={{ color: '#3B6D11' }} />}
              {m.tendance === 'down' && <TrendingDown size={18} style={{ color: '#A32D2D' }} />}
              {m.tendance === 'flat' && <Minus size={18} style={{ color: '#888780' }} />}
            </div>
          )
        })}
      </div>

      {/* Évolution mensuelle */}
      <p className="font-bold text-sm mb-3" style={{ color: '#1E2A26' }}>Sessions par mois</p>
      <div className="rounded-xl p-3" style={{ background: '#fff', border: '1px solid #ECEFED' }}>
        <div className="flex items-end justify-around gap-2" style={{ height: 120 }}>
          {mois.map((m, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-xs font-semibold" style={{ color: '#1F5A4D' }}>{m.count}</span>
              <div className="w-full rounded-t" style={{ height: Math.round(m.count / maxMois * 90), minHeight: 4, background: '#2E7D6B' }} />
              <span className="text-xs" style={{ color: '#6E827B' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-center mt-5" style={{ color: '#9aa8a2' }}>
        La moyenne /20 se remplira avec les corrections notées par Claude (à venir).
      </p>
    </div>
  )
}
