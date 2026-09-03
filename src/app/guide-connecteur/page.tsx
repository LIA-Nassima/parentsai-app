'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { LogoIAla } from '@/components/brand/LogoIAla'

const MCP_URL = 'https://mcp.parentsai.eu/mcp'

interface Etape {
  titre: string
  desc: React.ReactNode
  image: string
  note?: React.ReactNode
}

export default function GuideConnecteur() {
  const router = useRouter()
  const [copie, setCopie] = useState(false)

  function copierUrl() {
    navigator.clipboard.writeText(MCP_URL)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  const etapes: Etape[] = [
    {
      titre: 'Ouvrez les Connecteurs',
      desc: <>Dans l’app <strong>Claude</strong> → <strong>Paramètres</strong> → <strong>Connecteurs</strong>. Appuyez sur le <strong>+</strong> en haut à droite.</>,
      image: '/guide/g1-connecteurs.jpeg',
    },
    {
      titre: 'Ajouter un connecteur personnalisé',
      desc: <>Dans le menu, choisissez <strong>« Ajouter un connecteur personnalisé »</strong>.</>,
      image: '/guide/g2-ajouter.jpeg',
    },
    {
      titre: 'Renseignez IAla',
      desc: (
        <>
          <strong>Nom :</strong> <strong>IAla</strong><br />
          <strong>URL :</strong> collez l’adresse ci-dessous<br />
          Laissez <strong>« Connexion requise » désactivée</strong>, puis validez avec le <strong>✓</strong> en haut à droite.
        </>
      ),
      image: '/guide/g3-formulaire.jpeg',
    },
    {
      titre: 'Le connecteur IAla apparaît',
      desc: <>IAla s’ajoute à la liste avec son nombre d’outils. 🎉</>,
      image: '/guide/g4-ajoute.jpeg',
    },
    {
      titre: 'Ouvrez « Tous les outils »',
      desc: <>Appuyez sur le connecteur <strong>IAla</strong>, puis tout en haut sur <strong>« Tous les outils »</strong>.</>,
      image: '/guide/g5-outils.png',
    },
    {
      titre: 'Choisissez « Toujours autoriser »',
      desc: <>Sélectionnez <strong>« Toujours autoriser »</strong> (et non « Approbation requise »). Tous les outils sont autorisés d’un coup — Claude ne vous redemandera plus jamais.</>,
      image: '/guide/g6-toujours.png',
    },
  ]

  return (
    <div className="min-h-screen pb-12" style={{ background: '#F7F8FA' }}>
      {/* En-tête */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: 'linear-gradient(155deg, #35907B 0%, #2E7D6B 45%, #1F5A4D 100%)',
          borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
          boxShadow: '0 4px 20px rgba(31,90,77,0.25)',
        }}
      >
        <div className="relative max-w-app mx-auto px-4 pt-3 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-white/85 text-sm font-medium hover:text-white transition-colors">
              <ArrowLeft size={18} strokeWidth={2.2} /> Retour
            </button>
            <LogoIAla size={24} dark={false} />
            <span className="w-14" />
          </div>
          <div className="text-center mt-2.5">
            <p className="text-white font-bold text-base">Brancher le connecteur IAla</p>
            <p className="text-white/70 text-xs">6 étapes, sur votre téléphone · ~2 min · une seule fois</p>
          </div>
        </div>
      </header>

      <div className="max-w-app mx-auto px-4 py-5 space-y-4">

        {/* URL à copier — mise en avant */}
        <div className="rounded-2xl p-4" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: '#6E827B' }}>L’adresse à coller (étape 3)</p>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#F4F6F5', border: '1px solid #E3E7E5' }}>
            <code className="flex-1 text-xs font-mono break-all" style={{ color: '#2E7D6B' }}>{MCP_URL}</code>
            <button
              onClick={copierUrl}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
              style={{ background: copie ? '#E3F0EC' : '#2E7D6B', color: copie ? '#1F5A4D' : '#fff' }}
            >
              {copie ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier</>}
            </button>
          </div>
        </div>

        {/* Les 6 étapes */}
        {etapes.map((e, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-white text-sm"
                  style={{ background: '#2E7D6B' }}
                >
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm mb-1" style={{ color: '#1E2A26' }}>{e.titre}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#6E827B' }}>{e.desc}</p>
                  {e.note && (
                    <p className="text-xs mt-2 rounded-lg p-2 leading-relaxed" style={{ color: '#1F5A4D', background: '#FDF8EA', border: '1px solid #EAD8A0' }}>
                      💡 {e.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div style={{ background: '#EEF2F0', borderTop: '1px solid #E3E7E5' }}>
              <img
                src={e.image}
                alt={`Étape ${i + 1} : ${e.titre}`}
                className="block mx-auto"
                style={{ maxWidth: '320px', width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        ))}

        {/* Fin */}
        <div className="rounded-2xl p-5 text-center" style={{ background: '#E3F0EC', border: '1px solid #C2DED6' }}>
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-bold" style={{ color: '#1F5A4D' }}>C’est fait, IAla est branché !</p>
          <p className="text-sm mt-1" style={{ color: '#1F5A4D' }}>
            Vous ne le referez jamais. Il ne reste qu’à créer un prof par matière (onglet Profs).
          </p>
        </div>
      </div>
    </div>
  )
}
