'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { normaliserPrenom } from '@/lib/normaliser'

const CLASSES = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale']
const MCP_URL = 'mcp.parentsai.eu'

const ICONES_MATIERE: Record<string, string> = {
  'Mathématiques': '🔢',
  'Français': '📖',
  'Physique-Chimie': '🧪',
  'SVT': '🌱',
  'Technologie': '⚙️',
  'Histoire-Géographie-EMC': '🌍',
  'Anglais': '🇬🇧',
  'Espagnol': '🇪🇸',
  'Allemand': '🇩🇪',
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
  const [etape, setEtape] = useState<1 | 2 | 3>(1)
  const [enfant, setEnfant] = useState('')
  const [classe, setClasse] = useState('3ème')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [professeurs, setProfesseurs] = useState<Professeur[]>([])
  const [copie, setCopie] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copiesPermanents, setCopiesPermanents] = useState<Record<string, boolean>>({})

  // Charge l'état des "copiés" depuis localStorage au montage
  useEffect(() => {
    const data = localStorage.getItem('parentsai_copies')
    if (data) {
      try { setCopiesPermanents(JSON.parse(data)) } catch {}
    }
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

      // Met à jour l'input avec la forme canonique pour cohérence visuelle
      setEnfant(enfantNorm)

      // Charge les professeurs disponibles
      const resPofs = await fetch(
        `https://mcp.parentsai.eu/api/professeurs?enfant=${encodeURIComponent(enfantNorm)}&classe=${encodeURIComponent(classe)}`
      )
      const dataPofs = await resPofs.json()
      setProfesseurs(dataPofs.professeurs || [])
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
    router.push(`/parent/${encodeURIComponent(normaliserPrenom(enfant))}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light" style={{ fontFamily: 'Georgia, serif' }}>
            Parents<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>AI</span>
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            Configuration initiale
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all"
                style={{
                  background: etape >= n ? 'var(--primary)' : 'var(--border)',
                  color: etape >= n ? 'white' : 'var(--muted-foreground)',
                }}>
                {etape > n ? '✓' : n}
              </div>
              {n < 3 && <div className="w-8 h-px" style={{ background: etape > n ? 'var(--primary)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* ── ÉTAPE 1 : Famille ── */}
        {etape === 1 && (
          <div className="rounded-2xl p-8" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <h2 className="text-xl font-medium mb-1">Votre famille</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Commencez par configurer le profil de votre enfant.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prénom de l'enfant</label>
                <input
                  type="text"
                  value={enfant}
                  onChange={e => setEnfant(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && configurerFamille()}
                  placeholder="ex : Assia"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--background)' }}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Classe</label>
                <select
                  value={classe}
                  onChange={e => setClasse(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--background)' }}>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {erreur && <p className="text-sm" style={{ color: 'var(--accent)' }}>{erreur}</p>}

              <button
                onClick={configurerFamille}
                disabled={loading}
                className="w-full py-3 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--primary)' }}>
                {loading ? 'Configuration...' : 'Continuer →'}
              </button>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : Connexion Claude ── */}
        {etape === 2 && (
          <div className="rounded-2xl p-8" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <div className="text-3xl mb-3">🔗</div>
            <h2 className="text-xl font-medium mb-1">Connecter Claude</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Ajoutez le serveur MCP dans vos paramètres Claude.ai une seule fois.
            </p>

            <div className="rounded-xl p-4 mb-6" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>
                URL du serveur MCP
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-sm font-mono" style={{ color: 'var(--primary)' }}>{MCP_URL}</code>
                <button
                  onClick={() => copier(MCP_URL, 'mcp')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: copie === 'mcp' ? '#edf7f1' : 'var(--primary)',
                    color: copie === 'mcp' ? '#2d7a4f' : 'white',
                  }}>
                  {copie === 'mcp' ? '✓ Copié' : 'Copier'}
                </button>
              </div>
            </div>

            <div className="rounded-xl p-4 mb-6 text-sm"
              style={{ background: '#eef1f5', color: '#2e3b4e', border: '1px solid #c8d4e0' }}>
              <p className="font-medium mb-2">Comment faire :</p>
              <ol className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li>1. Ouvrez <strong>claude.ai</strong> → Paramètres → Connecteurs</li>
                <li>2. Ajoutez un serveur MCP avec l'URL ci-dessus</li>
                <li>3. Nommez-le <strong>"ParentsAI"</strong></li>
              </ol>
            </div>

            <button
              onClick={() => setEtape(3)}
              className="w-full py-3 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90"
              style={{ background: 'var(--primary)' }}>
              C'est fait, continuer →
            </button>
          </div>
        )}

        {/* ── ÉTAPE 3 : Professeurs ── */}
        {etape === 3 && (
          <div>
            <div className="rounded-2xl p-6 mb-4" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <div className="text-3xl mb-3">📚</div>
              <h2 className="text-xl font-medium mb-1">Créez vos projets Claude</h2>
              <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Pour chaque matière, créez un projet dans Claude.ai et collez les instructions ci-dessous.
              </p>
              <div className="rounded-lg p-3 text-xs" style={{ background: '#eef1f5', color: '#2e3b4e' }}>
                Créer un projet → Nommez-le → Collez les instructions dans "Project Instructions" → Connectez le MCP ParentsAI
              </div>
            </div>

            {professeurs.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
                Aucun professeur disponible pour le moment.
              </div>
            ) : (
              <>
                {/* Compteur progression */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                    Progression
                  </span>
                  <span className="text-sm font-medium">
                    {Object.values(copiesPermanents).filter(Boolean).length}/{professeurs.length} matières configurées
                  </span>
                </div>

                {/* Barre de progression */}
                <div className="h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full transition-all duration-300"
                    style={{
                      width: `${(Object.values(copiesPermanents).filter(Boolean).length / professeurs.length) * 100}%`,
                      background: '#2d7a4f',
                    }} />
                </div>

                {/* Accordéon */}
                <div className="space-y-2">
                  {professeurs.map((p) => {
                    const estCopie = !!copiesPermanents[p.matiere]
                    const estOuvert = expanded === p.matiere
                    const icone = ICONES_MATIERE[p.matiere] || '📚'

                    return (
                      <div key={p.matiere}
                        className="rounded-xl overflow-hidden transition-all"
                        style={{
                          background: 'white',
                          border: `1px solid ${estCopie ? '#2d7a4f' : 'var(--border)'}`,
                        }}>

                        {/* En-tête cliquable */}
                        <button
                          onClick={() => setExpanded(estOuvert ? null : p.matiere)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-2xl shrink-0">{icone}</span>
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{p.matiere}</div>
                              <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                                {p.niveau}{estCopie && ' · ✅ Template copié'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {estCopie && (
                              <span className="text-xs font-medium" style={{ color: '#2d7a4f' }}>✓</span>
                            )}
                            <span className="text-lg transition-transform" style={{
                              transform: estOuvert ? 'rotate(180deg)' : 'rotate(0deg)',
                              color: 'var(--muted-foreground)',
                            }}>⌄</span>
                          </div>
                        </button>

                        {/* Contenu déplié */}
                        {estOuvert && (
                          <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                            <p className="text-xs mt-3 mb-3" style={{ color: 'var(--muted-foreground)' }}>
                              Nom du projet suggéré : <em className="font-mono">{p.nom_projet}</em>
                            </p>
                            <pre className="text-xs rounded-lg p-3 overflow-x-auto mb-3"
                              style={{ background: 'var(--background)', color: 'var(--muted-foreground)', whiteSpace: 'pre-wrap' }}>
                              {p.template}
                            </pre>
                            <button
                              onClick={() => {
                                copier(p.template, `prof-${p.matiere}`)
                                marquerCopie(p.matiere)
                              }}
                              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                              style={{
                                background: copie === `prof-${p.matiere}` ? '#edf7f1' : (estCopie ? '#2d7a4f' : 'var(--primary)'),
                                color: copie === `prof-${p.matiere}` ? '#2d7a4f' : 'white',
                              }}>
                              {copie === `prof-${p.matiere}` ? '✓ Copié dans le presse-papier !' : (estCopie ? '🔁 Recopier le template' : '📋 Copier le template')}
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
              className="w-full mt-6 py-4 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90"
              style={{ background: '#2d7a4f' }}>
              ✅ Tout est prêt — Accéder au dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
