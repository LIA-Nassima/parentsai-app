'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { Famille } from '@/types'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function rediriger() {
      try {
        const res     = await fetch('https://mcp.parentsai.eu/api/familles')
        const json    = await res.json()
        const familles: Famille[] = json.familles || []
        if (familles.length === 0) {
          router.replace('/onboarding')
        } else {
          router.replace(`/espace/${encodeURIComponent(familles[0].enfant)}`)
        }
      } catch {
        router.replace('/onboarding')
      }
    }
    rediriger()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#2E7D6B' }}>
      <div className="text-center">
        <LogoIAla size={52} dark={false} />
        <p className="mt-3 text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
          chargement…
        </p>
      </div>
    </div>
  )
}
