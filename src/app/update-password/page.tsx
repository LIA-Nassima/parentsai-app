'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function UpdatePassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [erreur, setErreur]     = useState('')

  async function mettrAJour() {
    if (password.length < 6)   { setErreur('6 caractères minimum'); return }
    if (password !== confirm)   { setErreur('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    setErreur('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setErreur(error.message); setLoading(false); return }
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
            Nouveau mot de passe
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid var(--border)', background: 'var(--background)' }}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirmer</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && mettrAJour()}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid var(--border)', background: 'var(--background)' }}
              />
            </div>

            {erreur && <p className="text-sm" style={{ color: 'var(--accent)' }}>{erreur}</p>}

            <button
              onClick={mettrAJour}
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--primary)' }}>
              {loading ? 'Mise à jour...' : 'Enregistrer →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
