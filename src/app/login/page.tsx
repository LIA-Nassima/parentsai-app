'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [erreur, setErreur]     = useState('')

  async function seConnecter() {
    if (!email || !password) { setErreur('Email et mot de passe requis'); return }
    setLoading(true)
    setErreur('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErreur('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Parents<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>AI</span>
          </h1>
          <p className="mt-2 text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            Connexion
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && seConnecter()}
                placeholder="votre@email.fr"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid var(--border)', background: 'var(--background)' }}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && seConnecter()}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid var(--border)', background: 'var(--background)' }}
              />
            </div>

            {erreur && <p className="text-sm" style={{ color: 'var(--accent)' }}>{erreur}</p>}

            <button
              onClick={seConnecter}
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--primary)' }}>
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-medium underline" style={{ color: 'var(--primary)' }}>
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
