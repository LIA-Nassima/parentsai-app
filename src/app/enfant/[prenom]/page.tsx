'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import NavHeader from '@/components/NavHeader'
import { supabase } from '@/lib/supabase'
import { Session, Reponse, SessionAvecStats } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { normaliserPrenom } from '@/lib/normaliser'

const BADGE_CONFIG: Record<string, { emoji: string; color: string }> = {
  'en_attente': { emoji: '⏳', color: '#f59e0b' },
  'fait':       { emoji: '✏️', color: 'var(--accent)' },
  'validé':     { emoji: '✅', color: '#2d7a4f' },
}

export default function EspaceEnfant() {
  const params = useParams()
  const prenom = normaliserPrenom(decodeURIComponent(params.prenom as string))
  const [sessions, setSessions] = useState<SessionAvecStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chargerSessions()
  }, [prenom])

  async function chargerSessions() {
    setLoading(true)
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .eq('enfant', prenom)
      .order('created_at', { ascending: false })

    if (!sessionsData) { setLoading(false); return }

    const sessionsAvecStats: SessionAvecStats[] = await Promise.all(
      sessionsData.map(async (s: Session) => {
        const { data: reponses } = await supabase
          .from('reponses')
          .select('*')
          .eq('session_id', s.id)

        const r = (reponses || []) as Reponse[]
        return {
          ...s,
          qcm_total: r.filter(x => x.type === 'qcm').length,
          qcm_juste: r.filter(x => x.type === 'qcm' && x.est_correct).length,
          pb_termine: r.filter(x => x.type === 'probleme' && x.est_termine).length,
        }
      })
    )

    setSessions(sessionsAvecStats)
    setLoading(false)
  }

  const [filtreMat, setFiltreMat] = useState<string>('toutes')

  const matieres = ['toutes', ...Array.from(new Set(sessions.map(s => s.matiere)))]
  const sessionsFiltrees = filtreMat === 'toutes' ? sessions : sessions.filter(s => s.matiere === filtreMat)
  const derniereSession = sessions.find(s => s.statut !== 'validé') || sessions[0]
  const totalValides = sessions.filter(s => s.statut === 'validé').length
  const scoreGlobal = sessions.reduce((acc, s) => acc + s.qcm_juste, 0)
  const totalQcm = sessions.reduce((acc, s) => acc + s.qcm_total, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📚</div>
          <p style={{ color: 'var(--muted-foreground)' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <NavHeader />
      <div className="px-4 py-8 max-w-2xl mx-auto">

      {/* Header enfant */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🎓</div>
        <h1 className="text-2xl font-light" style={{ fontFamily: 'Georgia, serif' }}>
          Salut <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{prenom}</em> !
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {totalValides} session{totalValides > 1 ? 's' : ''} validée{totalValides > 1 ? 's' : ''} ·{' '}
          {totalQcm > 0 ? `${Math.round((scoreGlobal / totalQcm) * 100)}% de réussite` : 'Commence ta première session !'}
        </p>
      </div>

      {/* Lien vers le planning */}
      <div className="text-center mb-10">
        <Link href={`/planning/${encodeURIComponent(prenom)}`}
          className="inline-block px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)', color: 'white' }}>
          📅 Mon planning de la semaine
        </Link>
      </div>

      {/* Session en cours / dernière */}
      {derniereSession && derniereSession.statut !== 'validé' && (
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>
            À faire maintenant
          </p>
          <Link href={derniereSession.exercices_json ? `/session/${derniereSession.id}` : derniereSession.html_enfant_url}
            target={derniereSession.exercices_json ? undefined : '_blank'}>
            <Card className="border-2 hover:shadow-lg transition-shadow cursor-pointer"
              style={{ borderColor: 'var(--accent)' }}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--accent)' }}>
                      ⏳ En attente
                    </div>
                    <h2 className="font-semibold text-lg">{derniereSession.chapitre}</h2>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {derniereSession.matiere} · Session #{derniereSession.numero_session}
                    </p>
                  </div>
                  <div className="text-3xl">→</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Historique */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Toutes mes sessions
        </p>

        {/* Filtre matières */}
        {matieres.length > 2 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {matieres.map(mat => (
              <button key={mat} onClick={() => setFiltreMat(mat)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: filtreMat === mat ? 'var(--primary)' : 'white',
                  color: filtreMat === mat ? 'white' : 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}>
                {mat === 'toutes' ? 'Toutes' : mat}
              </button>
            ))}
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
            <div className="text-4xl mb-3">📖</div>
            <p>Aucune session pour le moment.</p>
            <p className="text-sm mt-1">Demande à tes parents de lancer une session !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessionsFiltrees.map(s => {
              const badge = BADGE_CONFIG[s.statut] || BADGE_CONFIG['en_attente']
              const date = new Date(s.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short'
              })
              const score = s.qcm_total > 0
                ? `${s.qcm_juste}/${s.qcm_total}`
                : null

              return (
                <Link
                  key={s.id}
                  href={s.exercices_json ? `/session/${s.id}` : s.html_enfant_url}
                  target={s.exercices_json ? undefined : '_blank'}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{badge.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{s.chapitre}</div>
                          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {s.matiere} · {date}
                          </div>
                        </div>
                        {score && (
                          <div className="text-sm font-medium" style={{ color: '#2d7a4f' }}>
                            {score}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      </div>
    </div>
  )
}
