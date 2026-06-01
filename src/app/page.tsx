'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Famille } from '@/types'

const ICONES_CLASSE: Record<string, string> = {
  '6ème': '🌱', '5ème': '📗', '4ème': '📘', '3ème': '🎓',
  '2nde': '🏫', '1ère': '📚', 'Terminale': '🏆',
}

export default function Home() {
  const router = useRouter()
  const [familles, setFamilles] = useState<Famille[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function charger() {
      try {
        const res  = await fetch('https://mcp.parentsai.eu/api/familles')
        const json = await res.json()
        const data: Famille[] = json.familles || []

        if (data.length === 0) {
          router.push('/onboarding')
          return
        }
        setFamilles(data)
      } catch {
        router.push('/onboarding')
        return
      }
      setLoading(false)
    }
    charger()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📚</div>
          <p style={{ color: 'var(--muted-foreground)' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Parents<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>AI</span>
          </h1>
          <p className="mt-2 text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            Le professeur particulier IA
          </p>
        </div>

        {/* Cartes enfants */}
        <div className="space-y-3">
          {familles.map(f => {
            const nbProfs       = (f.profs_configures || []).length
            const icone         = ICONES_CLASSE[f.classe] || '🎓'
            const tousConfigures = nbProfs >= 8

            return (
              <div
                key={f.enfant}
                className="rounded-2xl p-5"
                style={{ background: 'white', border: '1px solid var(--border)' }}
              >
                {/* En-tête de la carte */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icone}</span>
                    <div>
                      <div className="font-medium text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                        {f.enfant}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {f.classe}
                      </div>
                    </div>
                  </div>

                  {/* Badge profs configurés */}
                  <div
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: tousConfigures ? '#edf7f2' : '#f0ebe6',
                      color:      tousConfigures ? '#2d7a4f' : '#6b6560',
                    }}
                  >
                    {nbProfs === 0
                      ? '⚙️ À configurer'
                      : tousConfigures
                        ? `✅ ${nbProfs} profs`
                        : `📋 ${nbProfs} profs`}
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-2">
                  <a
                    href={`/espace/${encodeURIComponent(f.enfant)}`}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--primary)' }}
                  >
                    Ouvrir →
                  </a>
                  <a
                    href={`/espace/${encodeURIComponent(f.enfant)}?tab=profs`}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-center transition-opacity hover:opacity-90"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    title="Configurer les professeurs"
                  >
                    ⚙️
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {/* Ajouter un enfant */}
        <div className="mt-6 text-center">
          <a
            href="/onboarding"
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--muted-foreground)' }}
          >
            + Ajouter un enfant
          </a>
        </div>

        <p className="mt-8 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
          ParentsAI · Propulsé par Claude + MCP
        </p>
      </div>
    </div>
  )
}
