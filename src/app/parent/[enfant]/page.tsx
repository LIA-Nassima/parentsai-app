'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import NavHeader from '@/components/NavHeader'
import { supabase } from '@/lib/supabase'
import { Session, Reponse, SessionAvecStats } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { normaliserPrenom } from '@/lib/normaliser'

const STATUT_CONFIG = {
  'en_attente': { label: 'En attente', color: '#6b6560', bg: '#f0ebe6' },
  'fait':       { label: 'Fait',        color: '#c9543a', bg: '#fdf0ed' },
  'validé':     { label: 'Validé ✓',   color: '#2d7a4f', bg: '#edf7f2' },
}

// Normalise les noms de matières (ex: "Maths" → "Mathématiques")
function normaliserMatiere(m: string): string {
  const map: Record<string, string> = {
    'Maths': 'Mathématiques',
    'Math':  'Mathématiques',
    'maths': 'Mathématiques',
    'math':  'Mathématiques',
  }
  return map[m] ?? m
}

export default function DashboardParent() {
  const params = useParams()
  const enfant = normaliserPrenom(decodeURIComponent(params.enfant as string))
  const [sessions, setSessions] = useState<SessionAvecStats[]>([])
  const [loading, setLoading] = useState(true)
  const [filtreMat, setFiltreMat] = useState<string>('toutes')
  const [filtreEnfant, setFiltreEnfant] = useState<string>(enfant)

  useEffect(() => {
    chargerSessions()
  }, [enfant])

  async function chargerSessions() {
    setLoading(true)
    // Charge toutes les sessions de la famille (tous enfants)
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (!sessionsData) { setLoading(false); return }

    const sessionsAvecStats: SessionAvecStats[] = await Promise.all(
      sessionsData.map(async (s: Session) => {
        const { data: reponses } = await supabase
          .from('reponses').select('*').eq('session_id', s.id)
        const r = (reponses || []) as Reponse[]
        return {
          ...s,
          matiere: normaliserMatiere(s.matiere),
          qcm_total: r.filter(x => x.type === 'qcm').length,
          qcm_juste: r.filter(x => x.type === 'qcm' && x.est_correct).length,
          pb_termine: r.filter(x => x.type === 'probleme' && x.est_termine).length,
        }
      })
    )

    setSessions(sessionsAvecStats)
    setLoading(false)
  }

  // Listes uniques pour filtres
  const enfants  = Array.from(new Set(sessions.map(s => s.enfant)))
  const matieres = ['toutes', ...Array.from(new Set(
    sessions.filter(s => filtreEnfant === 'tous' || s.enfant === filtreEnfant).map(s => s.matiere)
  ))]

  const sessionsFiltrees = sessions
    .filter(s => filtreEnfant === 'tous' || s.enfant === filtreEnfant)
    .filter(s => filtreMat === 'toutes' || s.matiere === filtreMat)

  const totalSessions = sessionsFiltrees.length
  const totalValides  = sessionsFiltrees.filter(s => s.statut === 'validé').length
  const scoreGlobal   = sessionsFiltrees.reduce((acc, s) => acc + s.qcm_juste, 0)
  const totalQcm      = sessionsFiltrees.reduce((acc, s) => acc + s.qcm_total, 0)
  const pctReussite   = totalQcm > 0 ? Math.round((scoreGlobal / totalQcm) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p style={{ color: 'var(--muted-foreground)' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <NavHeader />
      <div className="px-4 py-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>
            Espace Parent
          </p>
          <h1 className="text-3xl font-light" style={{ fontFamily: 'Georgia, serif' }}>
            Suivi de <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{enfant}</em>
          </h1>
        </div>

        {/* Filtre par enfant (si plusieurs enfants) */}
        {enfants.length > 1 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {['tous', ...enfants].map(e => (
              <button key={e} onClick={() => { setFiltreEnfant(e); setFiltreMat('toutes') }}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: filtreEnfant === e ? 'var(--accent)' : 'white',
                  color: filtreEnfant === e ? 'white' : 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}>
                {e === 'tous' ? '👨‍👩‍👧 Tous' : `🎓 ${e}`}
              </button>
            ))}
          </div>
        )}

        {/* Stats globales */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card><CardContent className="pt-6 text-center">
            <div className="text-3xl font-light mb-1">{totalSessions}</div>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Sessions</div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <div className="text-3xl font-light mb-1">{totalValides}</div>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Validées</div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <div className="text-3xl font-light mb-1" style={{ color: pctReussite >= 70 ? '#2d7a4f' : 'var(--accent)' }}>
              {pctReussite}%
            </div>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Réussite QCM</div>
          </CardContent></Card>
        </div>

        {/* Barre de progression */}
        {totalQcm > 0 && (
          <Card className="mb-8">
            <CardHeader><CardTitle className="text-sm font-medium">Progression globale QCM</CardTitle></CardHeader>
            <CardContent>
              <Progress value={pctReussite} className="h-3" />
              <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                {scoreGlobal} bonnes réponses sur {totalQcm} questions
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filtre matières */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {matieres.map(mat => (
            <button key={mat} onClick={() => setFiltreMat(mat)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: filtreMat === mat ? 'var(--primary)' : 'white',
                color: filtreMat === mat ? 'white' : 'var(--foreground)',
                border: '1px solid var(--border)',
              }}>
              {mat === 'toutes' ? 'Toutes' : mat}
            </button>
          ))}
        </div>

        {/* Liste sessions */}
        {sessionsFiltrees.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
            Aucune session pour le moment
          </div>
        ) : (
          <div className="space-y-3">
            {sessionsFiltrees.map(s => {
              const statut = STATUT_CONFIG[s.statut] || STATUT_CONFIG['en_attente']
              const score  = s.qcm_total > 0 ? `${s.qcm_juste}/${s.qcm_total}` : null
              const date   = new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
              return (
                <Card key={s.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{date}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: statut.bg, color: statut.color }}>
                            {statut.label}
                          </span>
                          {enfants.length > 1 && (
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: 'var(--border)', color: 'var(--muted-foreground)' }}>
                              {s.enfant}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-sm mb-0.5">{s.matiere}</h3>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          {s.chapitre} · Session #{s.numero_session}
                        </p>
                        <div className="flex gap-3 mt-2">
                          {score && <span className="text-xs font-medium" style={{ color: '#2d7a4f' }}>📊 {score} QCM</span>}
                          {s.pb_termine > 0 && <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>✏️ {s.pb_termine} pb</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-right">
                        {/* Travail de l'enfant — visible seulement après soumission */}
                        {(s.statut === 'fait' || s.statut === 'validé') && (
                          <Link href={s.exercices_json ? `/session/${s.id}?mode=parent` : s.html_enfant_url}
                            target={s.exercices_json ? undefined : '_blank'}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
                            style={{ background: 'var(--primary)', color: 'white' }}>
                            📝 Travail de {s.enfant}
                          </Link>
                        )}
                        <Link href={s.exercices_json ? `/session/${s.id}?mode=parent` : s.html_parent_url}
                          target={s.exercices_json ? undefined : '_blank'}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
                          style={{ background: 'var(--border)', color: 'var(--foreground)' }}>
                          📋 Corrigés
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
