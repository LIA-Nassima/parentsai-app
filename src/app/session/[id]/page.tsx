'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, ArrowLeft, Printer } from 'lucide-react'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { lundiDeLaDate } from '@/lib/semaine'
import QCMExercice from '@/components/exercices/QCMExercice'
import ProblemeExercice from '@/components/exercices/ProblemeExercice'
import FicheView from '@/components/fiche/FicheView'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { supabase } from '@/lib/supabase'
import { Session, Reponse, ExerciceQCM, ExerciceProbleme } from '@/types'

export default function SessionPage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const sessionId    = params.id as string
  const modeParent   = searchParams.get('mode') === 'parent'
  const fromEnfant   = searchParams.get('from') === 'enfant'

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

  // Construit l'URL de retour en conservant le contexte (filtre / matière / sous-catégorie)
  function urlRetour(): string {
    const prenom = session?.enfant
    const qs = new URLSearchParams()
    const filtre = searchParams.get('filtre')
    const mat    = searchParams.get('mat')
    const cat    = searchParams.get('cat')
    if (filtre) qs.set('filtre', filtre)
    if (mat)    qs.set('mat', mat)
    if (cat)    qs.set('cat', cat)
    // Rouvre la semaine de la session (vue semaine par semaine)
    if (session?.created_at) qs.set('sem', lundiDeLaDate(session.created_at))
    const suffix = qs.toString() ? `?${qs.toString()}` : ''

    if (fromEnfant && prenom) {
      // L'enfant revient sur SA page (jamais l'espace parent)
      return `/enfant/${encodeURIComponent(prenom)}${suffix}`
    }
    // Le parent revient sur le suivi de l'enfant
    return prenom ? `/espace/${encodeURIComponent(prenom)}${suffix}` : '/'
  }

  async function validerSession() {
    if (!session) return
    setValidating(true)
    await supabase.from('sessions').update({ statut: 'validé' }).eq('id', sessionId)
    setValidating(false)
    router.push(urlRetour())
  }

  function retour() {
    router.push(urlRetour())
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F8FA' }}>
      <div className="text-center">
        <LogoIAla size={36} dark />
        <p className="mt-4 text-sm" style={{ color: '#6E827B' }}>Chargement des exercices...</p>
      </div>
    </div>
  )

  if (!session?.exercices_json) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F7F8FA' }}>
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

  // Une fiche de révision n'a pas d'exercices : rendu et impression dédiés.
  if (session.type_evaluation === 'fiche') {
    return <FicheView session={session} onRetour={retour} fromEnfant={fromEnfant} />
  }

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
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      <style>{`
        @media print {
          .session-no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .print-only { display: none; }
        @media print { .print-only { display: block !important; } }
      `}</style>

      {/* ── En-tête vert ── */}
      <header
        className="session-no-print sticky top-0 z-50 w-full"
        style={{
          background: 'linear-gradient(155deg, #35907B 0%, #2E7D6B 45%, #1F5A4D 100%)',
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
          boxShadow: '0 4px 20px rgba(31,90,77,0.25)',
        }}
      >
        {/* Étoile filigrane décorative */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }}
          aria-hidden="true"
        >
          <svg
            width={170} height={170} viewBox="-12 -12 24 24"
            style={{ position: 'absolute', top: -48, right: -38, opacity: 0.08 }}
          >
            <path
              d="M0 -9.5 L2.3 -2.9 L9.2 -2.9 L3.6 1.3 L5.7 8 L0 3.8 L-5.7 8 L-3.6 1.3 L-9.2 -2.9 L-2.3 -2.9 Z"
              fill="#fff"
            />
          </svg>
        </div>

        <div className="relative max-w-app mx-auto px-4 pt-3 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={retour}
              className="flex items-center gap-1 text-white/85 text-sm font-medium hover:text-white transition-colors"
            >
              <ArrowLeft size={18} strokeWidth={2.2} /> Retour
            </button>

            <LogoIAla size={26} dark={false} />

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
                style={{ background: '#E8B53A', color: '#7a5910' }}
              >
                <Printer size={14} /> Imprimer
              </button>
              <Link
                href={fromEnfant && session.enfant ? `/enfant/${encodeURIComponent(session.enfant)}` : '/'}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
                aria-label="Accueil"
              >
                <Home size={16} />
              </Link>
            </div>
          </div>

          <div className="text-center mt-2.5">
            <p className="text-white font-bold text-sm">{session.matiere}</p>
            <p className="text-white/70 text-xs">{session.chapitre}</p>
          </div>
        </div>
      </header>

      <div className="max-w-app mx-auto px-4 py-5">

        {/* Titre visible uniquement à l'impression */}
        <div className="print-only" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#1E2A26' }}>
            {isEval && titre ? titre : `${session.matiere} — ${session.chapitre}`}
          </p>
          <p style={{ fontSize: 12, color: '#6E827B' }}>
            {session.matiere} · {session.chapitre}{isEval && bareme_total ? ` · /${bareme_total} pts` : ''} · {session.enfant}
          </p>
        </div>

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
            className="session-no-print p-3.5 rounded-xl mb-5 text-sm font-bold text-center"
            style={{ background: isEval ? evalColor : '#2E7D6B', color: '#fff' }}
          >
            📋 MODE CORRIGÉS — {session.enfant} · {session.matiere}
          </div>
        )}

        {/* Stats */}
        {(qcmTotal > 0 || pbTermines > 0) && (
          <div className="session-no-print grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl p-4 text-center" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="text-2xl font-bold mb-0.5" style={{ color: '#1F5A4D' }}>
                {qcmTotal > 0 ? `${qcmJuste}/${qcmTotal}` : '—'}
              </div>
              <div className="text-xs uppercase tracking-wide" style={{ color: '#6E827B', fontSize: 10 }}>Score QCM</div>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="text-2xl font-bold mb-0.5" style={{ color: '#E8B53A' }}>
                {pbTermines}/{pbExos.length}
              </div>
              <div className="text-xs uppercase tracking-wide" style={{ color: '#6E827B', fontSize: 10 }}>Problèmes</div>
            </div>
          </div>
        )}

        {/* Correction de Claude — visible par l'enfant ET le parent une fois corrigée */}
        {session.correction_json && (
          <div
            className="rounded-2xl mb-5 overflow-hidden"
            style={{ background: '#fff', border: '1.5px solid #E8B53A', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="px-4 py-3" style={{ background: '#2E7D6B' }}>
              <span className="text-white font-bold text-sm">📋 Correction de Claude</span>
            </div>
            <div className="p-4">
              <div className="text-center mb-4">
                <div className="text-3xl font-extrabold" style={{ color: '#B8881F' }}>
                  {session.correction_json.note}/{session.correction_json.note_sur || 20}
                </div>
                <div className="text-xs uppercase tracking-wide" style={{ color: '#6E827B' }}>Note</div>
              </div>
              {session.correction_json.appreciation && (
                <div className="rounded-xl p-3 mb-4 text-sm leading-relaxed" style={{ background: '#E3F0EC', color: '#1F5A4D' }}>
                  {session.correction_json.appreciation}
                </div>
              )}
              {(session.correction_json.commentaires || []).map((cm, i) => (
                <div key={i} className="mb-3 pb-3" style={{ borderBottom: '1px solid #F0F1F3' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#2E7D6B' }}>Exercice {cm.exercice}</p>
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: '#1E2A26' }}>{cm.commentaire}</p>
                </div>
              ))}
              {session.correction_json.corrige_le && (
                <p className="text-xs text-center mt-2" style={{ color: '#9aa8a2' }}>
                  Corrigé par Claude le {session.correction_json.corrige_le}
                </p>
              )}
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
          <div className="session-no-print mt-8 text-center">
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
            className="session-no-print mt-8 p-4 rounded-xl text-center text-sm font-semibold"
            style={{ background: '#FDF8EA', color: '#B8881F', border: '1px solid #E8B53A' }}
          >
            ✉️ Travail envoyé au parent — en attente de correction
          </div>
        )}

        {/* Valider — côté parent */}
        {modeParent && session.statut === 'fait' && (
          <div className="session-no-print mt-8 text-center">
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
            className="session-no-print mt-8 p-4 rounded-xl text-center text-sm font-semibold"
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
