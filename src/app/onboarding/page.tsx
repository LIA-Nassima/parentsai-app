'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { normaliserPrenom } from '@/lib/normaliser'

const CLASSES = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale']
const MCP_URL = 'mcp.parentsai.eu'

const ICONES_MATIERE: Record<string, string> = {
  'Mathématiques': '🔢', 'Français': '📖', 'Physique-Chimie': '🧪',
  'SVT': '🌱', 'Technologie': '⚙️', 'Histoire-Géographie-EMC': '🌍',
  'Anglais': '🇬🇧', 'Espagnol': '🇪🇸', 'Allemand': '🇩🇪',
}

const COULEURS_MATIERE: Record<string, string> = {
  'Mathématiques': '#3B7DD9', 'Français': '#2E7D6B', 'Physique-Chimie': '#5BA491',
  'SVT': '#1F5A4D', 'Technologie': '#B8881F', 'Histoire-Géographie-EMC': '#E8B53A',
  'Anglais': '#3B7DD9', 'Espagnol': '#E2685C', 'Allemand': '#6E827B',
}

interface Professeur {
  matiere: string
  niveau: string
  competences: string[]
  template: string
  nom_projet: string
}

export default function Onboarding() {
  const router = useRouter()
  const [etape, setEtape]   = useState<1 | 2 | 3>(1)
  const [enfant, setEnfant] = useState('')
  const [classe, setClasse] = useState('3ème')
  const [loading, setLoading]   = useState(false)
  const [erreur, setErreur]     = useState('')
  const [professeurs, setProfesseurs]             = useState<Professeur[]>([])
  const [avertissementNiveau, setAvertissementNiveau] = useState<string | null>(null)
  const [copie, setCopie]     = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copiesPermanents, setCopiesPermanents] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const data = localStorage.getItem('parentsai_copies')
    if (data) { try { setCopiesPermanents(JSON.parse(data)) } catch {} }
  }, [])

  function marquerCopie(matiere: string) {
    const newCopies = { ...copiesPermanents, [matiere]: true }
    setCopiesPermanents(newCopies)
    localStorage.setItem('parentsai_copies', JSON.stringify(newCopies))
  }

  async function configurerFamille() {
    const enfantNorm = normaliserPrenom(enfant)
    if (!enfantNorm) { setErreur('Entrez le prénom de votre enfant'); return }
    setLoading(true)
    setErreur('')
    try {
      const res = await fetch('https://mcp.parentsai.eu/api/famille', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enfant: enfantNorm, classe }),
      })
      const data = await res.json()
      if (!data.succes) throw new Error(data.message)
      setEnfant(enfantNorm)
      const resPofs = await fetch(
        `https://mcp.parentsai.eu/api/professeurs?enfant=${encodeURIComponent(enfantNorm)}&classe=${encodeURIComponent(classe)}`
      )
      const dataPofs = await resPofs.json()
      setProfesseurs(dataPofs.professeurs || [])
      setAvertissementNiveau(dataPofs.avertissement || null)
      setEtape(2)
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : 'Erreur serveur')
    }
    setLoading(false)
  }

  function copier(texte: string, id: string) {
    navigator.clipboard.writeText(texte)
    setCopie(id)
    setTimeout(() => setCopie(null), 2000)
  }

  function terminer() {
    router.push(`/espace/${encodeURIComponent(normaliserPrenom(enfant))}`)
  }

  const nbCopies = Object.values(copiesPermanents).filter(Boolean).length

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F7F8FA' }}>

      {/* ── En-tête vert ── */}
      <div
        className="w-full pt-12 pb-8 px-5 flex flex-col items-center"
        style={{ background: '#2E7D6B', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <LogoIAla size={38} dark={false} />
        <p className="text-white font-bold text-lg mt-5">
          {etape === 1 ? 'Configuration' : etape === 2 ? 'Connexion MCP' : 'Créer les projets'}
        </p>

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-2 mt-5">
          {([1, 2, 3] as const).map(n => (
            <div key={n} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: etape >= n ? '#fff' : 'rgba(255,255,255,0.2)',
                  color: etape >= n ? '#2E7D6B' : 'rgba(255,255,255,0.7)',
                }}
              >
                {etape > n ? '✓' : n}
              </div>
              {n < 3 && (
                <div
                  className="w-6 h-0.5 rounded-full"
                  style={{ background: etape > n ? '#fff' : 'rgba(255,255,255,0.3)' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">

        {/* ÉTAPE 1 : Famille */}
        {etape === 1 && (
          <div className="rounded-2xl p-6" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <p className="font-bold text-base mb-1" style={{ color: '#1E2A26' }}>Votre enfant</p>
            <p className="text-sm mb-5" style={{ color: '#6E827B' }}>
              Commencez par configurer le profil de votre enfant.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1E2A26' }}>Prénom</label>
                <input
                  type="text"
                  value={enfant}
                  onChange={e => setEnfant(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && configurerFamille()}
                  placeholder="ex : Assia"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #DCE8E4', background: '#F7F8FA', color: '#1E2A26' }}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1E2A26' }}>Classe</label>
                <select
                  value={classe}
                  onChange={e => setClasse(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #DCE8E4', background: '#F7F8FA', color: '#1E2A26' }}
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {erreur && <p className="text-sm font-medium" style={{ color: '#D9483B' }}>{erreur}</p>}
              <button
                onClick={configurerFamille}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#2E7D6B' }}
              >
                {loading ? 'Configuration...' : 'Continuer →'}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : MCP */}
        {etape === 2 && (
          <div className="rounded-2xl p-6" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="text-3xl mb-3">🔗</div>
            <p className="font-bold text-base mb-1" style={{ color: '#1E2A26' }}>Connecter Claude</p>
            <p className="text-sm mb-5" style={{ color: '#6E827B' }}>
              Ajoutez le serveur MCP dans vos paramètres Claude.ai — une seule fois.
            </p>

            <div className="rounded-xl p-4 mb-5" style={{ background: '#F7F8FA', border: '1.5px solid #DCE8E4' }}>
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: '#6E827B' }}>URL du serveur MCP</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-sm font-mono" style={{ color: '#2E7D6B' }}>{MCP_URL}</code>
                <button
                  onClick={() => copier(MCP_URL, 'mcp')}
                  className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  style={{
                    background: copie === 'mcp' ? '#E3F0EC' : '#2E7D6B',
                    color:      copie === 'mcp' ? '#1F5A4D' : '#fff',
                  }}
                >
                  {copie === 'mcp' ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier</>}
                </button>
              </div>
            </div>

            <div className="rounded-xl p-4 mb-5 text-sm" style={{ background: '#E3F0EC' }}>
              <p className="font-bold mb-2" style={{ color: '#1F5A4D' }}>Comment faire :</p>
              <ol className="space-y-1 text-xs" style={{ color: '#1F5A4D' }}>
                <li>1. Ouvrez <strong>claude.ai</strong> → Paramètres → Connecteurs</li>
                <li>2. Ajoutez un serveur MCP avec l'URL ci-dessus</li>
                <li>3. Nommez-le <strong>"IAlla"</strong></li>
              </ol>
            </div>

            <button
              onClick={() => setEtape(3)}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90"
              style={{ background: '#2E7D6B' }}
            >
              C'est fait, continuer →
            </button>
          </div>
        )}

        {/* ÉTAPE 3 : Professeurs */}
        {etape === 3 && (
          <div>
            <div className="rounded-2xl p-5 mb-4" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <p className="font-bold text-base mb-1" style={{ color: '#1E2A26' }}>Créez vos projets Claude</p>
              <p className="text-sm mb-2" style={{ color: '#6E827B' }}>
                Pour chaque matière, créez un projet dans Claude.ai et collez les instructions.
              </p>
              <div className="rounded-xl p-3 text-xs" style={{ background: '#E3F0EC', color: '#1F5A4D' }}>
                Créer un projet → Nommez-le → Collez les instructions → Connectez le MCP IAlla
              </div>
            </div>

            {avertissementNiveau && (
              <div
                className="rounded-xl p-3 mb-4 text-sm"
                style={{ background: '#FBE6E3', border: '1px solid #F7CFC9', color: '#D9483B' }}
              >
                ⚠️ {avertissementNiveau}
              </div>
            )}

            {professeurs.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#6E827B' }}>
                Aucun professeur disponible pour le moment.
              </div>
            ) : (
              <>
                {/* Progression */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs uppercase tracking-wide" style={{ color: '#6E827B' }}>Progression</span>
                  <span className="text-xs font-semibold" style={{ color: '#1E2A26' }}>
                    {nbCopies}/{professeurs.length} configurées
                  </span>
                </div>
                <div className="h-2 rounded-full mb-5 overflow-hidden" style={{ background: '#E3F0EC' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(nbCopies / professeurs.length) * 100}%`, background: '#2E7D6B' }}
                  />
                </div>

                {/* Accordéon */}
                <div className="space-y-2">
                  {professeurs.map(p => {
                    const estCopie  = !!copiesPermanents[p.matiere]
                    const estOuvert = expanded === p.matiere
                    const icone     = ICONES_MATIERE[p.matiere] || '📚'
                    const couleur   = COULEURS_MATIERE[p.matiere] || '#2E7D6B'

                    return (
                      <div
                        key={p.matiere}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: '#fff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          border: `1.5px solid ${estCopie ? '#2E7D6B' : '#DCE8E4'}`,
                        }}
                      >
                        <button
                          onClick={() => setExpanded(estOuvert ? null : p.matiere)}
                          className="w-full px-4 py-3.5 flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-1 h-10 rounded-full shrink-0" style={{ background: couleur }} />
                            <div className="min-w-0">
                              <div className="font-bold text-sm uppercase tracking-wide truncate" style={{ color: '#1E2A26' }}>
                                {icone} {p.matiere}
                              </div>
                              <div className="text-xs truncate" style={{ color: '#6E827B' }}>
                                {p.niveau}{estCopie && ' · ✅ Template copié'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {estCopie && <span className="text-xs font-bold" style={{ color: '#2E7D6B' }}>✓</span>}
                            {estOuvert
                              ? <ChevronUp size={16} style={{ color: '#6E827B' }} />
                              : <ChevronDown size={16} style={{ color: '#6E827B' }} />
                            }
                          </div>
                        </button>

                        {estOuvert && (
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
                            <button
                              onClick={() => {
                                copier(p.template, `prof-${p.matiere}`)
                                marquerCopie(p.matiere)
                              }}
                              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                              style={{
                                background: copie === `prof-${p.matiere}` ? '#E3F0EC' : (estCopie ? '#1F5A4D' : '#2E7D6B'),
                                color: copie === `prof-${p.matiere}` ? '#1F5A4D' : '#fff',
                              }}
                            >
                              {copie === `prof-${p.matiere}`
                                ? <><Check size={14} /> Copié !</>
                                : estCopie
                                  ? <><Copy size={14} /> Recopier le template</>
                                  : <><Copy size={14} /> Copier les instructions</>
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <button
              onClick={terminer}
              className="w-full mt-6 py-4 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90"
              style={{ background: '#2E7D6B' }}
            >
              ✅ Tout est prêt — Accéder au dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
