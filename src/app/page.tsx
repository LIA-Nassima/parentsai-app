'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function rediriger() {
      // Lecture directe : la RLS Supabase ne renvoie que les familles du parent connecté
      const { data, error } = await supabase
        .from('familles')
        .select('enfant')
        .order('enfant')

      if (error || !data || data.length === 0) {
        router.replace('/onboarding')
      } else {
        router.replace(`/espace/${encodeURIComponent(data[0].enfant)}`)
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
