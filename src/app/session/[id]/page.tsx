'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { LogoIAla } from '@/components/brand/LogoIAla'
import QCMExercice from '@/components/exercices/QCMExercice'
import ProblemeExercice from '@/components/exercices/ProblemeExercice'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { supabase } from '@/lib/supabase'
import { Session, Reponse, ExerciceQCM, ExerciceProbleme } from '@/types'

export default function SessionPage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const sessionId    = params.id as string
  const modeParent   = searchParams.get('mode') === 'parent'

  const [session,    setSession]    = useState<Session | null>(null)
  const [reponses,   setReponses]   = useState<Reponse[]>([])
  const [loading,    setLoading]    = useState(true)
  const [validating, setValidating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleReponseQCM(exerciceNum: number, estCorrect: boolean) {
    setReponses(prev => {
      const existe = prev.find(r => r.exercice_num === exerciceNum)
      if (existe) return prev.map(r => r.exercice_num === exerciceNum ? { ...r, est_correct: estCorrect } : r)
      return [...prev, { exercice_num: exerciceNum, type: 'qcm', est_correct: estCorrect, session_id: sessionId } as Reponse]
    })
  }

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
    setValidating(false)
    router.push(`/espace/${session.enfant}`)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F2F8F6' }}>
      <div className="text-center">
        <LogoIAla size={36} dark />
        <p className="mt-4 text-sm" style={{ color: '#6E827B' }}>Chargement des exercices...</p>
      </div>
    </div>
  )

  if (!session?.exercices_json) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F2F8F6' }}>
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">📄</div>
        <p className="font-bold mb-2" style={{ color: '#1E2A26' }}>Exercices non disponibles</p>
        <p className="text-sm mb-4" style={{ color: '#6E827B' }}>Cette session a été créée avant la mise à jour.</p>
        {session?.html_enfant_url && (
          <a
            href={modeParent ? session.html_parent_url : session.html_enfant_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white inline-block"
            style={{ background: '#2E7D6B' }}
          >
            Voir la version HTML →
          </a>
        )}
      </div>
    </div>
  )

  const { exercices, niveau, duree_estimee, encouragement, competences, titre, bareme_total, calculatrice } = session.exercices_json
  const typeEval   = session.type_evaluation ?? 'session'
  const isDS       = typeEval === 'ds'
  const isBB       = typeEval === 'brevet_blanc'
  const isEval     = isDS || isBB

  const qcmExos    = exercices.filter(e => e.type === 'qcm') as ExerciceQCM[]
  const pbExos     = exercices.filter(e => e.type === 'probleme') as ExerciceProbleme[]
  const qcmJuste   = reponses.filter(r => r.type === 'qcm' && r.est_correct).length
  const qcmTotal   = reponses.filter(r => r.type === 'qcm').length
  const pbTermines = reponses.filter(r => r.type === 'probleme' && r.est_termine).length
  const estBloque  = !modeParent && (session.statut === 'fait' || session.statut === 'validé')

  const evalColor  = isDS ? '#B8881F' : '#27518f'
  const evalBg     = isDS ? '#FDF8EA' : '#E2ECFB'
  const evalBorder = isDS ? '#E8B53A' : '#93b4d4'
  const evalLabel  = isDS ? 'DEVOIR SURVEILLÉ' : 'BREVET BLANC'

  return (
    <div className="min-h-screen" style={{ background: '#F2F8F6' }}>

      {/* ── En-tête vert ── */}
      <header className="sticky top-0 z-50 w-full" style={{ background: '#2E7D6B' }}>
        <div
          className="max-w-app mx-auto px-4 pt-3 pb-4 flex items-center justify-between"
          style={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
        >
          <Link
            href={session.enfant ? `/espace/${encodeURIComponent(session.enfant)}` : '/'}
            className="flex items-center gap-1.5 text-white/70 text-xs hover:text-white transition-colors"
          >
            ← {session.enfant || 'Retour'}
          </Link>

          <div className="text-center">
            <p className="text-white font-bold text-sm">{session.matiere}</p>
            <p className="text-white/70 text-xs truncate max-w-[150px]">{session.chapitre}</p>
          </div>

          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          >
            <Home size={16} />
          </Link>
        </div>
      </header>

      <div className="max-w-app mx-auto px-4 py-5">

        {/* Bandeau DS / Brevet Blanc */}
        {isEval && (
          <div
            className="rounded-2xl px-4 py-3 mb-4 flex items-center justify-between"
            style={{ background: evalBg, border: `1.5px solid ${evalBorder}`, color: evalColor }}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-widest">{evalLabel}</span>
              {titre && <p className="text-sm font-semibold mt-0.5">{titre}</p>}
            </div>
            <div className="text-right text-xs">
              {bareme_total && <div className="font-bold text-base">/{bareme_total} pts</div>}
              <div>{duree_estimee}</div>
              {calculatrice !== undefined && (
                <div>{calculatrice ? '🖩 calculatrice' : '🚫 sans calc.'}</div>
              )}
            </div>
          </div>
        )}

        {/* Info session */}
        <div className="mb-5">
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#6E827B' }}>
            {isEval
              ? `${evalLabel} · ${session.matiere} · ${modeParent ? 'Corrigés' : session.enfant}`
              : `Session n°${String(session.numero_session).padStart(2, '0')} · ${niveau} · ${modeParent ? 'Corrigés' : session.enfant}`
            }
          </p>
          <p className="text-xs" style={{ color: '#6E827B' }}>
            {isEval
              ? `Durée : ${duree_estimee}${bareme_total ? ` · Barème sur ${bareme_total} points` : ''}`
              : `${competences?.join(', ')} · Durée estimée : ${duree_estimee}`
            }
          </p>
        </div>

        {/* Bandeau mode parent */}
        {modeParent && (
          <div
            className="p-3.5 rounded-xl mb-5 text-sm font-bold text-center"
            style={{ background: isEval ? evalColor : '#2E7D6B', color: '#fff' }}
          >
            📋 MODE CORRIGÉS — {session.enfant} · {session.matiere}
          </div>
        )}

        {/* Stats */}
        {(qcmTotal > 0 || pbTermines > 0) && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl p-4 text-center" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="text-2xl font-bold mb-0.5" style={{ color: '#1F5A4D' }}>
                {qcmTotal > 0 ? `${qcmJuste}/${qcmTotal}` : '—'}
              </div>
              <div className="text-xs uppercase tracking-wide" style={{ color: '#6E827B', fontSize: 10 }}>Score QCM</div>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="text-2xl font-bold mb-0.5" style={{ color: '#E8B53A' }}>
                {pbTermines}/{pbExos.length}
              </div>
              <div className="text-xs uppercase tracking-wide" style={{ color: '#6E827B', fontSize: 10 }}>Problèmes</div>
            </div>
          </div>
        )}

        {/* Encouragement */}
        {!modeParent && encouragement && (
          <div
            className="p-4 rounded-xl mb-5 text-sm italic text-center"
            style={{ background: '#E3F0EC', color: '#1F5A4D', border: '1px solid #C2DED6' }}
          >
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
                onReponse={handleReponseQCM}
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

        {/* Soumettre au parent — côté enfant */}
        {!modeParent && session.statut === 'en_attente' && (
          <div className="mt-8 text-center">
            <p className="text-xs mb-3" style={{ color: '#6E827B' }}>
              Quand tu as fini, envoie ton travail au parent.
            </p>
            <button
              onClick={soumettreAuParent}
              disabled={submitting}
              className="px-8 py-4 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#E8B53A' }}
            >
              {submitting ? 'Envoi...' : '📤 Envoyer au parent'}
            </button>
          </div>
        )}

        {/* Déjà soumis — côté enfant */}
        {!modeParent && session.statut === 'fait' && (
          <div
            className="mt-8 p-4 rounded-xl text-center text-sm font-semibold"
            style={{ background: '#FDF8EA', color: '#B8881F', border: '1px solid #E8B53A' }}
          >
            ✉️ Travail envoyé au parent — en attente de correction
          </div>
        )}

        {/* Valider — côté parent */}
        {modeParent && session.statut === 'fait' && (
          <div className="mt-8 text-center">
            <button
              onClick={validerSession}
              disabled={validating}
              className="px-8 py-4 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#2E7D6B' }}
            >
              {validating ? 'Validation...' : '✅ Valider la session'}
            </button>
          </div>
        )}

        {/* Validé */}
        {session.statut === 'validé' && (
          <div
            className="mt-8 p-4 rounded-xl text-center text-sm font-semibold"
            style={{ background: '#E3F0EC', color: '#1F5A4D', border: '1.5px solid #2E7D6B' }}
          >
            ✅ Session validée par le parent
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  )
}
