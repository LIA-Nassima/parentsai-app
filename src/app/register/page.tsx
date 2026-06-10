'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [erreur, setErreur]     = useState('')

  async function sInscrire() {
    if (!email || !password) { setErreur('Email et mot de passe requis'); return }
    if (password.length < 6)  { setErreur('Mot de passe : 6 caractères minimum'); return }
    if (password !== confirm)  { setErreur('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    setErreur('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setErreur(error.message); setLoading(false); return }
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F2F8F6' }}>
      <div
        className="w-full pt-14 pb-10 px-5 flex flex-col items-center"
        style={{ background: '#2E7D6B', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <LogoIAla size={40} dark={false} />
        <p className="text-white/70 text-xs mt-2 tracking-wide">allez, on révise</p>
        <p className="text-white font-bold text-xl mt-6">Créer un compte</p>
      </div>

      <div className="flex-1 px-5 pt-6 max-w-sm mx-auto w-full">
        <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1E2A26' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid #DCE8E4', background: '#F2F8F6', color: '#1E2A26' }}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1E2A26' }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6 caractères minimum"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid #DCE8E4', background: '#F2F8F6', color: '#1E2A26' }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1E2A26' }}>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sInscrire()}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid #DCE8E4', background: '#F2F8F6', color: '#1E2A26' }}
            />
          </div>
          {erreur && <p className="text-sm font-medium" style={{ color: '#D9483B' }}>{erreur}</p>}
          <button
            onClick={sInscrire}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#2E7D6B' }}
          >
            {loading ? 'Création...' : 'Créer mon compte →'}
          </button>
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm" style={{ color: '#6E827B' }}>
            Déjà un compte ?{' '}
            <Link href="/login" className="font-semibold underline" style={{ color: '#2E7D6B' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
