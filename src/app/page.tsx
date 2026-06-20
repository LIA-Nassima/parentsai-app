'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Plug, MessageSquareText, Smartphone, BarChart3, Check } from 'lucide-react'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [verif, setVerif] = useState(true)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setVerif(false); return } // visiteur non connecté → page d'accueil

      // Déjà connecté → on l'envoie directement dans son espace
      const { data } = await supabase.from('familles').select('enfant').order('enfant')
      if (!data || data.length === 0) router.replace('/onboarding')
      else router.replace(`/espace/${encodeURIComponent(data[0].enfant)}`)
    }
    check()
  }, [])

  if (verif) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#2E7D6B' }}>
      <div className="text-center">
        <LogoIAla size={52} dark={false} />
        <p className="mt-3 text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>chargement…</p>
      </div>
    </div>
  )

  const ETAPES = [
    { Icon: UserPlus,          titre: 'Créez le profil de votre enfant', texte: 'Son prénom et sa classe — c’est tout. En 30 secondes.' },
    { Icon: Plug,              titre: 'Branchez l’IA',                texte: 'Ajoutez le « connecteur » IAla dans Claude, comme une prise. Une seule fois.' },
    { Icon: MessageSquareText, titre: 'Demandez, l’IA crée',         texte: '« Une session de maths », « un DS sur Pythagore », « un brevet blanc »… et c’est prêt.' },
    { Icon: Smartphone,        titre: 'Votre enfant révise',             texte: 'Il ouvre son lien perso sur son téléphone et s’entraîne, où qu’il soit.' },
    { Icon: BarChart3,         titre: 'Vous suivez ses progrès',         texte: 'Semaine après semaine, matière par matière, ce qui est fait et à corriger.' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#fff' }}>

      {/* ── Barre du haut ── */}
      <header className="sticky top-0 z-50" style={{ background: '#2E7D6B' }}>
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <LogoIAla size={26} dark={false} />
          <Link href="/login" className="text-sm font-semibold text-white/90 hover:text-white transition-colors">
            Se connecter
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #35907B 0%, #2E7D6B 45%, #1F5A4D 100%)' }}
      >
        {/* étoile filigrane */}
        <svg width={260} height={260} viewBox="-12 -12 24 24" aria-hidden="true"
          style={{ position: 'absolute', top: -70, right: -60, opacity: 0.08 }}>
          <path d="M0 -9.5 L2.3 -2.9 L9.2 -2.9 L3.6 1.3 L5.7 8 L0 3.8 L-5.7 8 L-3.6 1.3 L-9.2 -2.9 L-2.3 -2.9 Z" fill="#fff" />
        </svg>

        <div className="relative max-w-3xl mx-auto px-5 pt-12 pb-14 text-center">
          <LogoIAla size={64} dark={false} />
          <p className="text-white/65 mt-3 uppercase tracking-widest" style={{ fontSize: 11, letterSpacing: '0.18em' }}>
            le professeur particulier IA
          </p>

          <h1 className="text-white font-extrabold mt-6 leading-tight" style={{ fontSize: 30 }}>
            Un prof particulier par IA pour chaque matière de votre collégien.
          </h1>
          <p className="text-white/85 mt-4 text-base leading-relaxed max-w-xl mx-auto">
            Exercices, devoirs surveillés et brevets blancs calés sur son vrai programme.
            Votre enfant révise sur son téléphone, vous suivez ses progrès.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/register"
              className="px-7 py-3.5 rounded-xl font-bold text-sm transition-transform active:scale-[0.98]"
              style={{ background: '#E8B53A', color: '#7a5910' }}>
              Créer un compte gratuitement
            </Link>
            <Link href="/login"
              className="px-7 py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* ── Le concept ── */}
      <section className="max-w-3xl mx-auto px-5 py-12 text-center">
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#6E827B' }}>Le concept</p>
        <h2 className="font-bold text-2xl mb-4" style={{ color: '#1E2A26' }}>
          L&apos;IA devient le prof particulier de votre enfant
        </h2>
        <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: '#6E827B' }}>
          IAla transforme l&apos;intelligence artificielle en <strong style={{ color: '#1E2A26' }}>professeur dédié, une matière à la fois</strong>.
          Il génère des révisions, des contrôles et des examens blancs adaptés à sa classe — et même calqués
          sur les vrais devoirs de son professeur si vous les lui montrez.
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mt-8 text-left">
          {[
            { t: 'Personnalisé', d: 'Adapté à sa classe, son niveau, son programme.' },
            { t: 'Illimité', d: 'Autant d’exercices que nécessaire, quand il veut.' },
            { t: 'Calé sur le réel', d: 'DS et brevets blancs à l’image de ceux du collège.' },
          ].map(c => (
            <div key={c.t} className="rounded-2xl p-4" style={{ background: '#F7F8FA', border: '1px solid #EEF0F2' }}>
              <p className="font-bold text-sm mb-1" style={{ color: '#2E7D6B' }}>{c.t}</p>
              <p className="text-sm" style={{ color: '#6E827B' }}>{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section style={{ background: '#F7F8FA' }}>
        <div className="max-w-3xl mx-auto px-5 py-12">
          <p className="text-xs uppercase tracking-widest font-semibold mb-2 text-center" style={{ color: '#6E827B' }}>
            Comment ça marche
          </p>
          <h2 className="font-bold text-2xl mb-8 text-center" style={{ color: '#1E2A26' }}>
            5 étapes, une seule installation
          </h2>

          <div className="space-y-3">
            {ETAPES.map((e, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl p-4"
                style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative"
                  style={{ background: '#E3F0EC', color: '#2E7D6B' }}>
                  <e.Icon size={20} />
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: '#2E7D6B', fontSize: 11 }}>{i + 1}</span>
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#1E2A26' }}>{e.titre}</p>
                  <p className="text-sm mt-0.5" style={{ color: '#6E827B' }}>{e.texte}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ce qu'il vous faut ── */}
      <section className="max-w-3xl mx-auto px-5 py-12">
        <div className="rounded-2xl p-6" style={{ background: '#FDF8EA', border: '1px solid #EAD8A0' }}>
          <p className="font-bold text-base mb-3" style={{ color: '#7a5910' }}>Ce qu&apos;il vous faut</p>
          {[
            'Un compte IAla (gratuit) — vous y êtes presque !',
            'Un compte Claude.ai (l’IA qui joue le rôle du prof).',
            'Le téléphone de votre enfant pour qu’il révise.',
          ].map(item => (
            <div key={item} className="flex items-start gap-2.5 mb-2">
              <Check size={17} style={{ color: '#2E7D6B', marginTop: 2 }} className="shrink-0" />
              <span className="text-sm" style={{ color: '#1E2A26' }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ background: '#2E7D6B' }}>
        <div className="max-w-3xl mx-auto px-5 py-14 text-center">
          <p className="text-white font-extrabold text-2xl mb-3">Allez, on révise ✦</p>
          <p className="text-white/80 mb-7 max-w-md mx-auto">
            Créez votre compte et configurez le premier prof de votre enfant en quelques minutes.
          </p>
          <Link href="/register"
            className="inline-block px-8 py-3.5 rounded-xl font-bold text-sm transition-transform active:scale-[0.98]"
            style={{ background: '#E8B53A', color: '#7a5910' }}>
            Créer un compte gratuitement
          </Link>
        </div>
      </section>

      {/* ── Pied ── */}
      <footer className="text-center py-6" style={{ background: '#1F5A4D' }}>
        <p className="text-white/50 text-xs">IAla · le professeur particulier IA · propulsé par l&apos;IA Claude</p>
      </footer>
    </div>
  )
}
