'use client'

import { ArrowLeft, Printer, BookOpen, CalendarDays, BookA, Users, ListChecks, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react'
import { LogoIAla } from '@/components/brand/LogoIAla'
import { Session, FicheData, FicheBloc, FicheItem } from '@/types'

// Couleur + icône par type de bloc
const STYLE_BLOC: Record<string, { bg: string; border: string; accent: string; Icon: typeof BookOpen }> = {
  plan:        { bg: '#E3F0EC', border: '#C2DED6', accent: '#1F5A4D', Icon: BookOpen },
  reperes:     { bg: '#FFFFFF', border: '#DCE8E4', accent: '#B8881F', Icon: CalendarDays },
  vocabulaire: { bg: '#FFFFFF', border: '#DCE8E4', accent: '#3B7DD9', Icon: BookA },
  personnages: { bg: '#FFFFFF', border: '#DCE8E4', accent: '#6A4FB3', Icon: Users },
  methode:     { bg: '#FFFFFF', border: '#DCE8E4', accent: '#6A4FB3', Icon: ListChecks },
  astuce:      { bg: '#FDF8EA', border: '#EAD8A0', accent: '#B8881F', Icon: Sparkles },
  erreurs:     { bg: '#FBE6E3', border: '#F2C9C3', accent: '#A32D2D', Icon: AlertTriangle },
  a_retenir:   { bg: '#E3F0EC', border: '#C2DED6', accent: '#1F5A4D', Icon: Lightbulb },
  schema:      { bg: '#FFFFFF', border: '#DCE8E4', accent: '#2E7D6B', Icon: ListChecks },
  formule:     { bg: '#FFFFFF', border: '#DCE8E4', accent: '#3B7DD9', Icon: ListChecks },
  propriete:   { bg: '#FFFFFF', border: '#DCE8E4', accent: '#3B7DD9', Icon: ListChecks },
  exemple:     { bg: '#FFFFFF', border: '#DCE8E4', accent: '#2E7D6B', Icon: ListChecks },
}

function asObjet(item: string | FicheItem): FicheItem | null {
  return typeof item === 'string' ? null : item
}

function ContenuBloc({ bloc }: { bloc: FicheBloc }) {
  const accent = (STYLE_BLOC[bloc.type] ?? STYLE_BLOC.exemple).accent

  switch (bloc.type) {
    case 'plan':
      return (
        <div className="flex flex-col gap-3.5">
          {(bloc.parties ?? []).map((p, i) => (
            <div key={i}>
              <p className="text-sm font-bold mb-1" style={{ color: accent }}>{p.titre}</p>
              <ul className="list-disc pl-5 space-y-1">
                {(p.points ?? []).map((pt, j) => (
                  <li key={j} className="text-sm leading-relaxed" style={{ color: '#1E2A26' }}>{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )

    case 'reperes':
      return (
        <div className="flex flex-col gap-1.5">
          {(bloc.items ?? []).map((it, i) => {
            const o = asObjet(it)
            return (
              <div key={i} className="flex gap-3 text-sm">
                <span className="font-bold shrink-0" style={{ color: accent, minWidth: 80 }}>{o?.date}</span>
                <span style={{ color: '#1E2A26' }}>{o?.evenement}</span>
              </div>
            )
          })}
        </div>
      )

    case 'vocabulaire':
      return (
        <div className="flex flex-col gap-1.5">
          {(bloc.items ?? []).map((it, i) => {
            const o = asObjet(it)
            return (
              <div key={i} className="text-sm leading-snug">
                <span className="font-bold" style={{ color: '#1E2A26' }}>{o?.terme}</span>
                <span style={{ color: '#6E827B' }}> — {o?.definition}</span>
              </div>
            )
          })}
        </div>
      )

    case 'personnages':
      return (
        <div className="flex flex-col gap-1.5">
          {(bloc.items ?? []).map((it, i) => {
            const o = asObjet(it)
            return (
              <div key={i} className="text-sm leading-snug">
                <span className="font-bold" style={{ color: '#1E2A26' }}>{o?.nom}</span>
                <span style={{ color: '#6E827B' }}> — {o?.role}</span>
              </div>
            )
          })}
        </div>
      )

    case 'methode':
      return (
        <div className="text-sm" style={{ color: '#1E2A26' }}>
          <p className="font-semibold">{(bloc.etapes ?? []).join('  ·  ')}</p>
          {bloc.note && <p className="mt-1.5 leading-relaxed" style={{ color: '#6E827B' }}>{bloc.note}</p>}
        </div>
      )

    case 'formule':
    case 'propriete':
      return (
        <div className="flex flex-col gap-1.5">
          {(bloc.items ?? []).map((it, i) => {
            const o = asObjet(it)
            return (
              <div key={i} className="text-sm leading-snug">
                <span className="font-bold" style={{ color: '#1E2A26' }}>{o?.formule || o?.nom}</span>
                <span style={{ color: '#6E827B' }}>{(o?.usage || o?.enonce) ? ` — ${o?.usage || o?.enonce}` : ''}</span>
              </div>
            )
          })}
        </div>
      )

    case 'erreurs':
      if (bloc.items && bloc.items.length > 0) {
        return (
          <ul className="list-disc pl-5 space-y-1">
            {bloc.items.map((it, i) => (
              <li key={i} className="text-sm leading-relaxed" style={{ color: '#A32D2D' }}>
                {typeof it === 'string' ? it : ''}
              </li>
            ))}
          </ul>
        )
      }
      return <p className="text-sm leading-relaxed" style={{ color: '#A32D2D' }}>{bloc.texte}</p>

    default:
      // astuce, a_retenir, schema, exemple : texte / description
      return (
        <p className="text-sm leading-relaxed" style={{ color: bloc.type === 'astuce' ? '#7a5910' : '#1E2A26' }}>
          {bloc.texte || bloc.description}
        </p>
      )
  }
}

export default function FicheView({
  session, onRetour, fromEnfant,
}: {
  session: Session
  onRetour: () => void
  fromEnfant: boolean
}) {
  const fiche = session.exercices_json as unknown as FicheData
  const blocs = fiche?.blocs ?? []

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      <style>{`
        @media print {
          .fiche-no-print { display: none !important; }
          .fiche-print-area { padding: 0 !important; }
        }
        .fiche-print-area { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>

      {/* En-tête (non imprimé) */}
      <header
        className="fiche-no-print sticky top-0 z-50 w-full"
        style={{
          background: 'linear-gradient(155deg, #35907B 0%, #2E7D6B 45%, #1F5A4D 100%)',
          borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
          boxShadow: '0 4px 20px rgba(31,90,77,0.25)',
        }}
      >
        <div className="relative max-w-app mx-auto px-4 pt-3 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={onRetour} className="flex items-center gap-1 text-white/85 text-sm font-medium hover:text-white transition-colors">
              <ArrowLeft size={18} strokeWidth={2.2} /> Retour
            </button>
            <LogoIAla size={26} dark={false} />
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
              style={{ background: '#E8B53A', color: '#7a5910' }}
            >
              <Printer size={15} /> Imprimer
            </button>
          </div>
          <div className="text-center mt-2.5">
            <p className="text-white font-bold text-sm">{session.matiere}</p>
            <p className="text-white/70 text-xs">Fiche de révision</p>
          </div>
        </div>
      </header>

      <div className="fiche-print-area max-w-app mx-auto px-4 py-5">

        {/* Titre + badges */}
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#E3F0EC', color: '#1F5A4D' }}>{session.matiere}</span>
            {fiche?.niveau && <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#F1EFE8', color: '#5F5E5A' }}>{fiche.niveau}</span>}
          </div>
          <h1 className="text-xl font-extrabold leading-tight" style={{ color: '#1E2A26' }}>{fiche?.titre || session.chapitre}</h1>
        </div>

        {/* Problématique */}
        {fiche?.problematique && (
          <div className="rounded-xl px-4 py-2.5 mb-3" style={{ background: '#F3EFFB', border: '1px solid #D9CDF0' }}>
            <span className="text-sm font-semibold" style={{ color: '#6A4FB3' }}>Problématique — </span>
            <span className="text-sm" style={{ color: '#3d2d63' }}>{fiche.problematique}</span>
          </div>
        )}

        {/* Blocs */}
        <div className="flex flex-col gap-3">
          {blocs.map((bloc, i) => {
            const st = STYLE_BLOC[bloc.type] ?? STYLE_BLOC.exemple
            return (
              <div key={i} className="rounded-2xl p-4" style={{ background: st.bg, border: `1px solid ${st.border}` }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: st.accent, color: '#fff' }}>
                    <st.Icon size={15} />
                  </span>
                  <span className="text-sm font-bold" style={{ color: st.accent }}>{bloc.titre}</span>
                </div>
                <ContenuBloc bloc={bloc} />
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: '#9aa8a2' }}>
          Fiche générée par IAla · à imprimer et garder pour réviser
        </p>

        <div className="pb-8" />
      </div>
    </div>
  )
}
