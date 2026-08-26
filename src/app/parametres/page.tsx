'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Copy, Check, GraduationCap } from 'lucide-react'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { supabase } from '@/lib/supabase'
import { normaliserPrenom } from '@/lib/normaliser'

const CLASSES = ['CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde']
const COULEURS_AVATAR = ['#E8B53A', '#3B7DD9', '#D9483B', '#5BA491', '#B8881F', '#2E7D6B']

interface Famille {
  enfant: string
  classe: string
  access_token: string
}

export default function Parametres() {
  const router = useRouter()
  const [familles, setFamilles]   = useState<Famille[]>([])
  const [loading, setLoading]     = useState(true)
  const [busy, setBusy]           = useState(false)
  const [msg, setMsg]             = useState<string | null>(null)
  const [copie, setCopie]         = useState<string | null>(null)
  const [ajout, setAjout]         = useState(false)
  const [nouvPrenom, setNouvPrenom] = useState('')
  const [nouvClasse, setNouvClasse] = useState('6ème')

  async function charger() {
    setLoading(true)
    const { data } = await supabase
      .from('familles').select('enfant, classe, access_token').order('enfant')
    setFamilles((data || []) as Famille[])
    setLoading(false)
  }
  useEffect(() => { charger() }, [])

  async function changerClasse(enfant: string, classe: string) {
    setBusy(true); setMsg(null)
    // On remet les profs à "non configuré" : les projets Claude devront recevoir les instructions de la nouvelle classe.
    const { error } = await supabase
      .from('familles').update({ classe, profs_configures: [] }).eq('enfant', enfant)
    if (error) setMsg(`Erreur : ${error.message}`)
    else setMsg(`Classe de ${enfant} mise à jour en ${classe}. ⚠️ Pense à recopier les instructions ${classe} dans tes projets Claude (onglet Profs).`)
    await charger(); setBusy(false)
  }

  async function ajouterEnfant() {
    const norm = normaliserPrenom(nouvPrenom)
    if (!norm) { setMsg('Entre un prénom.'); return }
    setBusy(true); setMsg(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMsg('Session expirée — reconnecte-toi.'); setBusy(false); return }
    const { error } = await supabase.from('familles').upsert(
      { enfant: norm, classe: nouvClasse, access_token: crypto.randomUUID(), parent_id: user.id },
      { onConflict: 'enfant' },
    )
    if (error) setMsg(`Impossible d'ajouter ${norm} : ${error.message}`)
    else {
      setMsg(`${norm} ajouté en ${nouvClasse} ! Configure ses profs depuis son espace.`)
      setNouvPrenom(''); setAjout(false)
    }
    await charger(); setBusy(false)
  }

  function copierLien(f: Famille) {
    const url = `${window.location.origin}/enfant/${encodeURIComponent(f.enfant)}?t=${f.access_token}`
    navigator.clipboard.writeText(url)
    setCopie(f.enfant); setTimeout(() => setCopie(null), 2000)
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F7F8FA' }}>

      {/* En-tête */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: 'linear-gradient(155deg, #35907B 0%, #2E7D6B 45%, #1F5A4D 100%)',
          borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
          boxShadow: '0 4px 20px rgba(31,90,77,0.25)',
        }}
      >
        <div className="relative max-w-app mx-auto px-4 pt-3 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-white/85 text-sm font-medium hover:text-white transition-colors">
              <ArrowLeft size={18} strokeWidth={2.2} /> Retour
            </button>
            <LogoIAla size={26} dark={false} />
            <span className="w-8" />
          </div>
          <div className="text-center mt-2.5">
            <p className="text-white font-bold text-sm">Configuration</p>
            <p className="text-white/70 text-xs">Mes enfants</p>
          </div>
        </div>
      </header>

      <div className="max-w-app mx-auto px-4 py-5">

        {msg && (
          <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: '#E3F0EC', border: '1px solid #C2DED6', color: '#1F5A4D' }}>
            {msg}
          </div>
        )}

        {loading ? (
          <p className="text-center py-16 text-sm" style={{ color: '#6E827B' }}>Chargement...</p>
        ) : (
          <div className="space-y-3">
            {familles.map((f, i) => (
              <div key={f.enfant} className="rounded-2xl p-4" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
                    style={{ background: COULEURS_AVATAR[i % COULEURS_AVATAR.length] }}>
                    {f.enfant.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base" style={{ color: '#1E2A26' }}>{f.enfant}</p>
                    <p className="text-xs" style={{ color: '#6E827B' }}>{f.classe}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/espace/${encodeURIComponent(f.enfant)}`)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl shrink-0"
                    style={{ background: '#E3F0EC', color: '#1F5A4D' }}
                  >
                    Espace →
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#1E2A26' }}>
                    <GraduationCap size={15} style={{ color: '#2E7D6B' }} /> Classe
                  </label>
                  <select
                    value={f.classe}
                    disabled={busy}
                    onChange={e => changerClasse(f.enfant, e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ border: '1.5px solid #DCE8E4', background: '#F7F8FA', color: '#1E2A26' }}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <button
                    onClick={() => copierLien(f)}
                    className="ml-auto text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
                    style={{ background: copie === f.enfant ? '#E3F0EC' : '#2E7D6B', color: copie === f.enfant ? '#1F5A4D' : '#fff' }}
                  >
                    {copie === f.enfant ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Lien de {f.enfant}</>}
                  </button>
                </div>
              </div>
            ))}

            {/* Ajouter un enfant */}
            {ajout ? (
              <div className="rounded-2xl p-4" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1.5px solid #2E7D6B' }}>
                <p className="font-bold text-sm mb-3" style={{ color: '#1E2A26' }}>Ajouter un enfant</p>
                <div className="space-y-3">
                  <input
                    type="text" value={nouvPrenom} onChange={e => setNouvPrenom(e.target.value)}
                    placeholder="Prénom" autoFocus
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ border: '1.5px solid #DCE8E4', background: '#F7F8FA', color: '#1E2A26' }}
                  />
                  <select
                    value={nouvClasse} onChange={e => setNouvClasse(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ border: '1.5px solid #DCE8E4', background: '#F7F8FA', color: '#1E2A26' }}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={ajouterEnfant} disabled={busy}
                      className="flex-1 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50" style={{ background: '#2E7D6B' }}>
                      {busy ? 'Ajout...' : 'Ajouter'}
                    </button>
                    <button onClick={() => { setAjout(false); setNouvPrenom('') }}
                      className="px-4 py-3 rounded-xl font-bold text-sm" style={{ background: '#F7F8FA', color: '#6E827B', border: '1.5px solid #DCE8E4' }}>
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setAjout(true); setMsg(null) }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm"
                style={{ background: '#fff', color: '#2E7D6B', border: '1.5px dashed #2E7D6B' }}
              >
                <Plus size={18} /> Ajouter un enfant
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
