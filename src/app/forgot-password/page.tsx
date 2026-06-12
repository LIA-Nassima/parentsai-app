'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogoIAla } from '@/components/brand/LogoIAla'
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
    <div className="min-h-screen flex flex-col" style={{ background: '#F7F8FA' }}>
      <div
        className="w-full pt-14 pb-10 px-5 flex flex-col items-center"
        style={{ background: '#2E7D6B', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <LogoIAla size={40} dark={false} />
        <p className="text-white font-bold text-xl mt-6">Mot de passe oublié</p>
      </div>

      <div className="flex-1 px-5 pt-6 max-w-sm mx-auto w-full">
        <div className="rounded-2xl p-6" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {envoye ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <p className="font-bold mb-2" style={{ color: '#1E2A26' }}>Email envoyé !</p>
              <p className="text-sm" style={{ color: '#6E827B' }}>
                Vérifie ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: '#6E827B' }}>
                Entre ton email — on t'envoie un lien pour réinitialiser ton mot de passe.
              </p>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1E2A26' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && envoyer()}
                  placeholder="votre@email.fr"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #DCE8E4', background: '#F7F8FA', color: '#1E2A26' }}
                  autoFocus
                />
              </div>
              {erreur && <p className="text-sm font-medium" style={{ color: '#D9483B' }}>{erreur}</p>}
              <button
                onClick={envoyer}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#2E7D6B' }}
              >
                {loading ? 'Envoi...' : 'Envoyer le lien →'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 text-center">
          <Link href="/login" className="text-sm font-semibold underline" style={{ color: '#2E7D6B' }}>
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
