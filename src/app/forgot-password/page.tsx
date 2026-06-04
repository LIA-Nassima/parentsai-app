'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [envoye, setEnvoye]   = useState(false)
  const [erreur, setErreur]   = useState('')

  async function envoyer() {
    if (!email) { setErreur('Entrez votre email'); return }
    setLoading(true)
    setErreur('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) { setErreur(error.message); setLoading(false); return }
    setEnvoye(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Parents<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>AI</span>
          </h1>
          <p className="mt-2 text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            Mot de passe oublié
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'white', border: '1px solid var(--border)' }}>
          {envoye ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📬</div>
              <p className="font-medium mb-2">Email envoyé !</p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Vérifie ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Entre ton email — on t'envoie un lien pour réinitialiser ton mot de passe.
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && envoyer()}
                  placeholder="votre@email.fr"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--background)' }}
                  autoFocus
                />
              </div>

              {erreur && <p className="text-sm" style={{ color: 'var(--accent)' }}>{erreur}</p>}

              <button
                onClick={envoyer}
                disabled={loading}
                className="w-full py-3 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--primary)' }}>
                {loading ? 'Envoi...' : 'Envoyer le lien →'}
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <Link href="/login" className="font-medium underline" style={{ color: 'var(--primary)' }}>
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
