'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { supabase } from '@/lib/supabase'

// La présentation d'IAla (landing marketing) vit désormais sur la vitrine
// https://parentsai.eu. Ici, sur l'app, la racine n'est plus qu'un aiguillage :
//   • non connecté      → /login
//   • connecté sans enfant → /onboarding
//   • connecté           → son espace
export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data } = await supabase.from('familles').select('enfant').order('enfant')
      if (!data || data.length === 0) router.replace('/onboarding')
      else router.replace(`/espace/${encodeURIComponent(data[0].enfant)}`)
    }
    check()
  }, [])

  // Écran de transition pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#2E7D6B' }}>
      <div className="text-center">
        <LogoIAla size={52} dark={false} />
        <p className="mt-3 text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>chargement…</p>
      </div>
    </div>
  )
}
