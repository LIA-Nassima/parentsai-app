'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, Baby, Activity, TrendingUp } from 'lucide-react'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'n_hamzaoui@yahoo.fr'

interface Stats {
  comptes: number
  nbEnfants: number
  moyenne: number
  totalSessions: number
  actives7: number
  actives30: number
  nouveaux7: number
  nouveaux30: number
  parClasse: Record<string, number>
  jours: { date: string; label: string; count: number }[]
  recentes: { email: string; nbEnfants: number; date: string }[]
}

const ORDRE_CLASSES = ['CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale']

export default function AdminPage() {
  const router = useRouter()
  const [etat, setEtat]   = useState<'verif' | 'refuse' | 'ok'>('verif')
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function charger() {
      const { data: { session } } = await supabase.auth.getSession()
      const email = session?.user?.email?.toLowerCase()
      if (!session || email !== ADMIN_EMAIL) { setEtat('refuse'); return }

      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) { setEtat('refuse'); return }
      setStats(await res.json())
      setEtat('ok')
    }
    charger()
  }, [])

  if (etat === 'verif') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#2E7D6B' }}>
      <div className="text-center">
        <LogoIAla size={44} dark={false} />
        <p className="mt-3 text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>chargement…</p>
      </div>
    </div>
  )

  if (etat === 'refuse') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F7F8FA' }}>
      <div className="text-center max-w-xs">
        <div className="text-6xl mb-5">🔒</div>
        <p className="font-bold text-lg mb-2" style={{ color: '#1E2A26' }}>Accès réservé</p>
        <p className="text-sm mb-5" style={{ color: '#6E827B' }}>Ce tableau de bord est réservé à l'administrateur.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: '#2E7D6B' }}
        >
          Se connecter
        </button>
      </div>
    </div>
  )

  if (!stats) return null

  const maxJour = Math.max(1, ...stats.jours.map(j => j.count))
  const jours14 = stats.jours.slice(-14)
  const classesTriees = Object.entries(stats.parClasse)
    .sort((a, b) => ORDRE_CLASSES.indexOf(a[0]) - ORDRE_CLASSES.indexOf(b[0]))
  const maxClasse = Math.max(1, ...Object.values(stats.parClasse))

  const KPIS = [
    { label: 'Nouveaux · 7 j',  value: stats.nouveaux7,  Icon: UserPlus, accent: '#2E7D6B' },
    { label: 'Nouveaux · 30 j', value: stats.nouveaux30, Icon: TrendingUp, accent: '#B8881F' },
    { label: 'Comptes parents', value: stats.comptes,    Icon: Users, accent: '#3B7DD9' },
    { label: 'Enfants',         value: stats.nbEnfants,  Icon: Baby, accent: '#7C4DB0' },
    { label: 'Actifs · 7 j',    value: stats.actives7,   Icon: Activity, accent: '#17A398' },
    { label: 'Sessions',        value: stats.totalSessions, Icon: Activity, accent: '#D46A2E' },
  ]

  return (
    <div className="min-h-screen pb-16" style={{ background: '#F7F8FA' }}>
      {/* En-tête */}
      <header className="w-full" style={{ background: 'linear-gradient(160deg, #35907B 0%, #2E7D6B 45%, #1F5A4D 100%)' }}>
        <div className="max-w-4xl mx-auto px-5 pt-5 pb-6">
          <div className="flex items-center justify-between">
            <LogoIAla size={26} dark={false} />
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              Admin
            </span>
          </div>
          <h1 className="text-white font-extrabold text-2xl mt-3">Tableau de bord</h1>
          <p className="text-white/75 text-sm mt-0.5">Suivi des inscriptions et de l'activité</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 -mt-3">
        {/* Cartes KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {KPIS.map(k => (
            <div key={k.label} className="rounded-2xl p-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <k.Icon size={16} style={{ color: k.accent }} />
                <span className="text-xs uppercase tracking-wide" style={{ color: '#6E827B', fontSize: 10.5 }}>{k.label}</span>
              </div>
              <div className="text-3xl font-extrabold" style={{ color: '#1E2A26' }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Nouvelles inscriptions par jour */}
        <section className="rounded-2xl p-5 mt-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ color: '#1E2A26' }}>Nouvelles inscriptions</h2>
            <span className="text-xs" style={{ color: '#6E827B' }}>14 derniers jours</span>
          </div>
          <div className="flex items-end justify-between gap-1.5" style={{ height: 140 }}>
            {jours14.map(j => (
              <div key={j.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <span className="text-xs font-bold" style={{ color: j.count > 0 ? '#2E7D6B' : '#C7D2CE', fontSize: 11 }}>
                  {j.count > 0 ? j.count : ''}
                </span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${(j.count / maxJour) * 96 + (j.count > 0 ? 6 : 2)}px`,
                    background: j.count > 0 ? '#2E7D6B' : '#EDF1EF',
                    minHeight: 2,
                  }}
                  title={`${j.label} : ${j.count}`}
                />
                <span className="whitespace-nowrap" style={{ color: '#9aa8a2', fontSize: 9 }}>{j.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Répartition par classe */}
        <section className="rounded-2xl p-5 mt-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 className="font-bold text-sm mb-4" style={{ color: '#1E2A26' }}>Répartition par classe</h2>
          {classesTriees.length === 0 ? (
            <p className="text-sm" style={{ color: '#6E827B' }}>Aucune donnée.</p>
          ) : (
            <div className="space-y-2.5">
              {classesTriees.map(([classe, n]) => (
                <div key={classe} className="flex items-center gap-3">
                  <span className="text-xs font-semibold w-16 shrink-0" style={{ color: '#1E2A26' }}>{classe}</span>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: '#EDF1EF' }}>
                    <div className="h-full rounded-full" style={{ width: `${(n / maxClasse) * 100}%`, background: '#2E7D6B', minWidth: 8 }} />
                  </div>
                  <span className="text-xs font-bold w-6 text-right shrink-0" style={{ color: '#1F5A4D' }}>{n}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Dernières inscriptions */}
        <section className="rounded-2xl p-5 mt-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 className="font-bold text-sm mb-3" style={{ color: '#1E2A26' }}>Dernières inscriptions</h2>
          {stats.recentes.length === 0 ? (
            <p className="text-sm" style={{ color: '#6E827B' }}>Aucune inscription.</p>
          ) : (
            <div className="divide-y" style={{ borderColor: '#F0F1F3' }}>
              {stats.recentes.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#2E7D6B' }}>
                      {r.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#1E2A26' }}>{r.email}</p>
                      <p className="text-xs" style={{ color: '#6E827B' }}>
                        {r.nbEnfants} enfant{r.nbEnfants > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: '#9aa8a2' }}>
                    {r.date ? new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
