'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogoIAla } from '@/components/brand/LogoIAla'
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
    <div className="min-h-screen flex flex-col" style={{ background: '#F7F8FA' }}>
      <div
        className="w-full pt-14 pb-10 px-5 flex flex-col items-center"
        style={{ background: '#2E7D6B', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <LogoIAla size={40} dark={false} />
        <p className="text-white font-bold text-xl mt-6">Nouveau mot de passe</p>
      </div>

      <div className="flex-1 px-5 pt-6 max-w-sm mx-auto w-full">
        <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1E2A26' }}>Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6 caractères minimum"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid #DCE8E4', background: '#F7F8FA', color: '#1E2A26' }}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1E2A26' }}>Confirmer</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && mettrAJour()}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid #DCE8E4', background: '#F7F8FA', color: '#1E2A26' }}
            />
          </div>
          {erreur && <p className="text-sm font-medium" style={{ color: '#D9483B' }}>{erreur}</p>}
          <button
            onClick={mettrAJour}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#2E7D6B' }}
          >
            {loading ? 'Mise à jour...' : 'Enregistrer →'}
          </button>
        </div>
      </div>
    </div>
  )
}
