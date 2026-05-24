'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import NavHeader from '@/components/NavHeader'
import QCMExercice from '@/components/exercices/QCMExercice'
import ProblemeExercice from '@/components/exercices/ProblemeExercice'
import { supabase } from '@/lib/supabase'
import { Session, Reponse, ExerciceQCM, ExerciceProbleme } from '@/types'

export default function SessionPage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const sessionId    = params.id as string
  const modeParent   = searchParams.get('mode') === 'parent'

  const [session,    setSession]    = useState<Session | null>(null)
  const [reponses,   setReponses]   = useState<Reponse[]>([])
  const [loading,    setLoading]    = useState(true)
  const [validating, setValidating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { charger() }, [sessionId])

  async function charger() {
    setLoading(true)
    const [{ data: s }, { data: r }] = await Promise.all([
      supabase.from('sessions').select('*').eq('id', sessionId).single(),
      supabase.from('reponses').select('*').eq('session_id', sessionId),
    ])
    if (s) setSession(s)
    if (r) setReponses(r)
    setLoading(false)
  }

  async function soumettreAuParent() {
    if (!session) return
    setSubmitting(true)
    await supabase.from('sessions').update({ statut: 'fait' }).eq('id', sessionId)
    setSession({ ...session, statut: 'fait' })
    setSubmitting(false)
  }

  async function validerSession() {
    if (!session) return
    setValidating(true)
    await supabase.from('sessions').update({ statut: 'validé' }).eq('id', sessionId)
    setSession({ ...session, statut: 'validé' })
    setValidating(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📚</div>
          <p style={{ color: 'var(--muted-foreground)' }}>Chargement des exercices...</p>
        </div>
      </div>
    )
  }

  if (!session?.exercices_json) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">📄</div>
          <p className="font-medium mb-2">Exercices non disponibles</p>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Cette session a été créée avant la mise à jour de l'app.
          </p>
          {session?.html_enfant_url && (
            <a href={modeParent ? session.html_parent_url : session.html_enfant_url}
              target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded-lg text-sm font-medium text-white inline-block"
              style={{ background: 'var(--primary)' }}>
              Voir la version HTML →
            </a>
          )}
        </div>
      </div>
    )
  }

  const { exercices, niveau, duree_estimee, encouragement, competences } = session.exercices_json
  const qcmExos    = exercices.filter(e => e.type === 'qcm') as ExerciceQCM[]
  const pbExos     = exercices.filter(e => e.type === 'probleme') as ExerciceProbleme[]
  const qcmJuste   = reponses.filter(r => r.type === 'qcm' && r.est_correct).length
  const qcmTotal   = reponses.filter(r => r.type === 'qcm').length
  const pbTermines = reponses.filter(r => r.type === 'probleme' && r.est_termine).length
  // Bloque les modifications si déjà soumis ou validé (sauf en mode parent qui a ses propres règles)
  const estBloque  = !modeParent && (session.statut === 'fait' || session.statut === 'validé')

  return (
    <div className="min-h-screen">
      <NavHeader />
      <div className="px-4 py-8 max-w-3xl mx-auto">

        {/* Header session */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>
            Session n°{String(session.numero_session).padStart(2,'0')} · {niveau} · {modeParent ? 'Corrigés' : session.enfant}
          </p>
          <h1 className="text-2xl font-light mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            {session.matiere} — <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{session.chapitre}</em>
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {competences?.join(', ')} · Durée estimée : {duree_estimee}
          </p>
        </div>

        {/* Bandeau parent */}
        {modeParent && (
          <div className="p-4 rounded-xl mb-6 text-sm font-mono text-center"
            style={{ background: 'var(--primary)', color: 'white' }}>
            📋 MODE CORRIGÉS — {session.enfant} · {session.matiere}
          </div>
        )}

        {/* Stats (si réponses enregistrées) */}
        {(qcmTotal > 0 || pbTermines > 0) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-4 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-light mb-1" style={{ color: '#2d7a4f' }}>
                {qcmTotal > 0 ? `${qcmJuste}/${qcmTotal}` : '—'}
              </div>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Score QCM</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-light mb-1" style={{ color: 'var(--accent)' }}>
                {pbTermines}/{pbExos.length}
              </div>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Problèmes terminés</div>
            </div>
          </div>
        )}

        {/* Encouragement */}
        {!modeParent && encouragement && (
          <div className="p-4 rounded-xl mb-6 text-sm italic text-center"
            style={{ background: '#eef1f5', color: '#2e3b4e', border: '1px solid #c8d4e0' }}>
            💪 {encouragement}
          </div>
        )}

        {/* Exercices */}
        {exercices.map(ex => {
          const repExo = reponses.find(r => r.exercice_num === ex.num)
          if (ex.type === 'qcm') {
            return (
              <QCMExercice key={ex.num}
                exercice={ex as ExerciceQCM}
                sessionId={sessionId}
                reponseInitiale={repExo?.reponse_index ?? null}
                modeParent={modeParent}
                estBloque={estBloque}
              />
            )
          }
          return (
            <ProblemeExercice key={ex.num}
              exercice={ex as ExerciceProbleme}
              sessionId={sessionId}
              estTermineInitial={repExo?.est_termine ?? false}
              photoUrlInitiale={repExo?.photo_url ?? null}
              modeParent={modeParent}
              estBloque={estBloque}
            />
          )
        })}

        {/* Bouton "Soumettre au parent" — côté enfant uniquement */}
        {!modeParent && session.statut === 'en_attente' && (
          <div className="mt-8 text-center">
            <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
              Quand tu as fini tous les exercices, envoie ton travail au parent.
            </p>
            <button onClick={soumettreAuParent} disabled={submitting}
              className="px-8 py-4 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent)' }}>
              {submitting ? 'Envoi...' : '📤 Envoyer au parent'}
            </button>
          </div>
        )}

        {/* Bandeau "déjà soumis" — côté enfant */}
        {!modeParent && session.statut === 'fait' && (
          <div className="mt-8 p-4 rounded-xl text-center text-sm font-medium"
            style={{ background: '#fff8e1', color: '#b45309', border: '1px solid #fbbf24' }}>
            ✉️ Travail envoyé au parent — en attente de correction
          </div>
        )}

        {/* Bouton validation — côté parent uniquement */}
        {modeParent && session.statut === 'fait' && (
          <div className="mt-8 text-center">
            <button onClick={validerSession} disabled={validating}
              className="px-8 py-4 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#2d7a4f' }}>
              {validating ? 'Validation...' : '✅ Valider la session'}
            </button>
          </div>
        )}

        {session.statut === 'validé' && (
          <div className="mt-8 p-4 rounded-xl text-center text-sm font-medium"
            style={{ background: '#edf7f1', color: '#2d7a4f', border: '1px solid #2d7a4f' }}>
            ✅ Session validée par le parent
          </div>
        )}

      </div>
    </div>
  )
}
