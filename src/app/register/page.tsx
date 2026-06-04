'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    if (error) {
      setErreur(error.message)
      setLoading(false)
      return
    }
    router.push('/onboarding')
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
            Créer un compte
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
                placeholder="6 caractères minimum"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid var(--border)', background: 'var(--background)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sInscrire()}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid var(--border)', background: 'var(--background)' }}
              />
            </div>

            {erreur && <p className="text-sm" style={{ color: 'var(--accent)' }}>{erreur}</p>}

            <button
              onClick={sInscrire}
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--primary)' }}>
              {loading ? 'Création...' : 'Créer mon compte →'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Déjà un compte ?{' '}
          <Link href="/login" className="font-medium underline" style={{ color: 'var(--primary)' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
