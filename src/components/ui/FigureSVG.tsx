'use client'

// Nettoyage minimal du SVG (le contenu vient de notre pipeline IA, mais on retire
// tout script / gestionnaire d'événement par prudence avant l'injection).
function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
}

export function FigureSVG({ svg }: { svg?: string | null }) {
  if (!svg || !svg.includes('<svg')) return null
  return (
    <figure className="my-4 rounded-xl p-3" style={{ background: '#fff', border: '1px solid #DCE8E4' }}>
      <div
        className="[&_svg]:w-full [&_svg]:h-auto"
        style={{ maxWidth: 460, margin: '0 auto' }}
        dangerouslySetInnerHTML={{ __html: sanitizeSvg(svg) }}
      />
      <figcaption className="text-center text-xs mt-2" style={{ color: '#9aa8a2' }}>
        Schéma indicatif — aide à la compréhension
      </figcaption>
    </figure>
  )
}
