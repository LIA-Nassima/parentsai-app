'use client'

import katex from 'katex'

// Affiche un texte pouvant contenir des maths LaTeX :
//   $...$   → formule en ligne (ex : $\vec{AB}$ → AB surmonté d'une flèche)
//   $$...$$ → formule centrée sur sa propre ligne
// Le texte hors formules est rendu tel quel (les retours à la ligne / espaces
// gérés par le parent via white-space sont préservés).

type Seg =
  | { type: 'texte'; valeur: string }
  | { type: 'math'; valeur: string; bloc: boolean }

function decouper(s: string): Seg[] {
  const out: Seg[] = []
  let i = 0
  while (i < s.length) {
    const dollar = s.indexOf('$', i)
    if (dollar === -1) {
      out.push({ type: 'texte', valeur: s.slice(i) })
      break
    }
    if (dollar > i) out.push({ type: 'texte', valeur: s.slice(i, dollar) })

    const bloc = s[dollar + 1] === '$'
    const debut = bloc ? dollar + 2 : dollar + 1
    const token = bloc ? '$$' : '$'
    const fin = s.indexOf(token, debut)

    if (fin === -1) {
      // Pas de délimiteur de fermeture : on rend le reste comme du texte
      out.push({ type: 'texte', valeur: s.slice(dollar) })
      break
    }
    out.push({ type: 'math', valeur: s.slice(debut, fin), bloc })
    i = fin + token.length
  }
  return out
}

export function TexteMath({ children }: { children?: string | null }) {
  const texte = children ?? ''
  if (!texte) return null
  if (!texte.includes('$')) return <>{texte}</>

  const segments = decouper(texte)
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'texte') return <span key={i}>{seg.valeur}</span>
        try {
          const html = katex.renderToString(seg.valeur, {
            throwOnError: false,
            displayMode: seg.bloc,
          })
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        } catch {
          return <span key={i}>{seg.valeur}</span>
        }
      })}
    </>
  )
}
