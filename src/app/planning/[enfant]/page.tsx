'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import NavHeader from '@/components/NavHeader'
import { supabase } from '@/lib/supabase'
import { Planning, Session, JourPlanning } from '@/types'
import { normaliserPrenom } from '@/lib/normaliser'

const ICONES_MATIERE: Record<string, string> = {
  'Mathématiques': '🔢',
  'Français': '📖',
  'Physique-Chimie': '🧪',
  'SVT': '🌱',
  'Technologie': '⚙️',
  'Histoire-Géographie-EMC': '🌍',
  'Anglais': '🇬🇧',
}

const JOURS_LABEL: Record<string, string> = {
  lundi: 'Lun',
  mardi: 'Mar',
  mercredi: 'Mer',
  jeudi: 'Jeu',
  vendredi: 'Ven',
  samedi: 'Sam',
  dimanche: 'Dim',
}

// Calcule le lundi de la semaine en cours (YYYY-MM-DD)
function lundiCourant(): string {
  const aujourd = new Date()
  const jourSem = aujourd.getDay() // 0=dim, 1=lun, ...
  const decalage = jourSem === 0 ? -6 : 1 - jourSem
  const lundi = new Date(aujourd)
  lundi.setDate(aujourd.getDate() + decalage)
  return lundi.toISOString().slice(0, 10)
}

// Décale une date de N semaines (renvoie YYYY-MM-DD)
function decalerSemaine(dateIso: string, deltaSemaines: number): string {
  const d = new Date(dateIso + 'T00:00:00')
  d.setDate(d.getDate() + deltaSemaines * 7)
  return d.toISOString().slice(0, 10)
}

function formaterDate(dateIso: string): string {
  const d = new Date(dateIso + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

export default function PagePlanning() {
  const params = useParams()
  const enfant = normaliserPrenom(decodeURIComponent(params.enfant as string))

  const [semaineDebut, setSemaineDebut] = useState<string>(lundiCourant())
  const [planning, setPlanning] = useState<Planning | null>(null)
  const [sessionsValidees, setSessionsValidees] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [pasDePlanning, setPasDePlanning] = useState(false)

  useEffect(() => { charger() }, [enfant, semaineDebut])

  async function charger() {
    setLoading(true)
    setPasDePlanning(false)
    const finSemaine = decalerSemaine(semaineDebut, 1)

    const [{ data: p }, { data: s }] = await Promise.all([
      supabase
        .from('plannings')
        .select('*')
        .eq('enfant', enfant)
        .eq('semaine_debut', semaineDebut)
        .maybeSingle(),
      supabase
        .from('sessions')
        .select('*')
        .eq('enfant', enfant)
        .eq('statut', 'validé')
        .gte('created_at', semaineDebut)
        .lt('created_at', finSemaine),
    ])

    if (p) setPlanning(p as Planning)
    else setPasDePlanning(true)
    if (s) setSessionsValidees(s as Session[])
    setLoading(false)
  }

  // Détermine si une case de planning est complétée (matching session validée)
  function estComplete(j: JourPlanning): boolean {
    if (j.type !== 'session') return false
    return sessionsValidees.some(
      s => s.matiere === j.matiere && s.chapitre === j.chapitre
    )
  }

  const data = planning?.planning_json
  const totalSessions = data?.jours.filter(j => j.type === 'session').length || 0
  const completes = data?.jours.filter(j => estComplete(j)).length || 0

  return (
    <div className="min-h-screen">
      <NavHeader enfantOverride={enfant} />
      <div className="px-4 py-8 max-w-3xl mx-auto">

        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>
            Planning révisions
          </p>
          <h1 className="text-2xl font-light mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Semaine de <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{enfant}</em>
          </h1>
        </div>

        {/* Navigation semaines */}
        <div className="flex items-center justify-between mb-6 gap-2">
          <button
            onClick={() => setSemaineDebut(decalerSemaine(semaineDebut, -1))}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'white', border: '1px solid var(--border)' }}>
            ← Précédente
          </button>
          <div className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
            Semaine du {formaterDate(semaineDebut)}
          </div>
          <button
            onClick={() => setSemaineDebut(decalerSemaine(semaineDebut, 1))}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'white', border: '1px solid var(--border)' }}>
            Suivante →
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2 animate-pulse">📅</div>
            <p style={{ color: 'var(--muted-foreground)' }}>Chargement du planning...</p>
          </div>
        )}

        {!loading && pasDePlanning && (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'white', border: '1px dashed var(--border)' }}>
            <div className="text-4xl mb-3">📅</div>
            <p className="font-medium mb-2">Aucun planning pour cette semaine</p>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Demande au Coach dans Claude :<br/>
              <code className="text-xs" style={{ color: 'var(--primary)' }}>
                Planning de la semaine du {formaterDate(semaineDebut)}
              </code>
            </p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* Récap focus + vigilance */}
            <div className="rounded-2xl p-5 mb-5"
              style={{ background: '#eef1f5', color: '#2e3b4e', border: '1px solid #c8d4e0' }}>
              <p className="text-xs uppercase tracking-widest mb-2 opacity-70">Focus de la semaine</p>
              <p className="text-sm mb-3">{data.focus}</p>
              {data.points_vigilance && (
                <>
                  <p className="text-xs uppercase tracking-widest mb-2 opacity-70">⚠️ Vigilance</p>
                  <p className="text-sm italic">{data.points_vigilance}</p>
                </>
              )}
            </div>

            {/* Progression */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                Progression
              </span>
              <span className="text-sm font-medium">
                {completes}/{totalSessions} sessions validées
              </span>
            </div>
            <div className="h-1.5 rounded-full mb-6 overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full transition-all duration-300"
                style={{
                  width: totalSessions > 0 ? `${(completes / totalSessions) * 100}%` : '0%',
                  background: '#2d7a4f',
                }} />
            </div>

            {/* Grille jours */}
            <div className="space-y-2">
              {data.jours.map(j => {
                const fait = estComplete(j)
                const isRepos = j.type === 'repos'
                const icone = j.matiere ? (ICONES_MATIERE[j.matiere] || '📚') : '💤'

                return (
                  <div key={j.date}
                    className="rounded-xl p-4 flex items-center gap-4"
                    style={{
                      background: 'white',
                      border: `1px solid ${fait ? '#2d7a4f' : 'var(--border)'}`,
                      opacity: isRepos ? 0.7 : 1,
                    }}>
                    {/* Jour */}
                    <div className="text-center shrink-0 w-12">
                      <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                        {JOURS_LABEL[j.jour]}
                      </div>
                      <div className="text-lg font-light">
                        {j.date.slice(8, 10)}
                      </div>
                    </div>

                    {/* Icône */}
                    <div className="text-2xl shrink-0">{icone}</div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      {isRepos ? (
                        <>
                          <div className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                            Repos
                          </div>
                          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {j.raison || '—'}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm font-medium truncate">
                            {j.matiere} <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}>
                              · {j.duree_min} min
                            </span>
                          </div>
                          <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                            {j.chapitre}{j.raison && ` — ${j.raison}`}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Statut */}
                    <div className="shrink-0">
                      {fait && (
                        <span className="text-lg" style={{ color: '#2d7a4f' }} title="Session validée">✅</span>
                      )}
                      {!fait && !isRepos && (
                        <span className="text-xs px-2 py-1 rounded-full"
                          style={{ background: '#fff8e1', color: '#b45309', border: '1px solid #fbbf24' }}>
                          à faire
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
