'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [enfants, setEnfants] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function charger() {
      const { data } = await supabase
        .from('familles')
        .select('enfant')
        .order('enfant')

      if (data && data.length > 0) {
        const noms = data.map((f: { enfant: string }) => f.enfant)
        setEnfants(noms)

        // Si un seul enfant, redirige directement vers l'espace parent
        if (noms.length === 1) {
          router.push(`/parent/${noms[0]}`)
          return
        }
      } else {
        // Aucune famille → onboarding
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

  // Plusieurs enfants ou aucun configuré
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Parents<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>AI</span>
          </h1>
          <p className="mt-2 text-sm uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            Le professeur particulier IA
          </p>
        </div>

        {enfants.length === 0 ? (
          <div style={{ color: 'var(--muted-foreground)' }} className="text-sm">
            <div className="text-4xl mb-4">🔧</div>
            <p>Aucune famille configurée.</p>
            <p className="mt-1">Lance <code>configurer_famille()</code> depuis Claude.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Choisissez un profil :
            </p>
            {enfants.map(nom => (
              <div key={nom} className="rounded-2xl p-5" style={{ border: '1px solid var(--border)', background: 'white' }}>
                <div className="text-lg font-medium mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                  🎓 {nom}
                </div>
                <div className="flex gap-3">
                  <a
                    href={`/parent/${nom}`}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-center text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--primary)' }}
                  >
                    👩‍👧 Parent
                  </a>
                  <a
                    href={`/enfant/${nom}`}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-center transition-opacity hover:opacity-90"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  >
                    📚 Enfant
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-10 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          ParentsAI · Propulsé par Claude + MCP
        </p>
      </div>
    </div>
  )
}
