'use client'

// Ancienne route /parent/[enfant] — redirige automatiquement vers le nouvel espace
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { normaliserPrenom } from '@/lib/normaliser'

export default function AnciennePageParent() {
  const params = useParams()
  const router = useRouter()
  const enfant = normaliserPrenom(decodeURIComponent(params.enfant as string))

  useEffect(() => {
    router.replace(`/espace/${encodeURIComponent(enfant)}`)
  }, [enfant, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">📚</div>
        <p style={{ color: 'var(--muted-foreground)' }}>Redirection...</p>
      </div>
    </div>
  )
}
