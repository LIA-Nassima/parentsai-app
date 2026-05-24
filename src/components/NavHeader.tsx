'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

interface Props {
  enfantOverride?: string  // utilisé sur /session/[id] où l'URL n'a pas le prénom
}

export default function NavHeader({ enfantOverride }: Props = {}) {
  const params = useParams()
  const pathname = usePathname()
  const enfant = (enfantOverride || params?.enfant || params?.prenom || '') as string
  const isParent = pathname.startsWith('/parent')
  const isEnfant = pathname.startsWith('/enfant')

  return (
    <header className="sticky top-0 z-50 border-b" style={{ background: 'white', borderColor: 'var(--border)' }}>
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href={enfant ? `/parent/${enfant}` : '/'} className="text-lg font-light" style={{ fontFamily: 'Georgia, serif' }}>
          Parents<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>AI</span>
        </Link>

        {/* Navigation */}
        <nav className="flex gap-2">
          <Link
            href={enfant ? `/parent/${enfant}` : '/'}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: isParent ? 'var(--primary)' : 'transparent',
              color: isParent ? 'white' : 'var(--muted-foreground)',
              border: isParent ? 'none' : '1px solid var(--border)',
            }}
          >
            👩‍👧 Parent
          </Link>
          <Link
            href={enfant ? `/enfant/${enfant}` : '/'}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: isEnfant ? 'var(--primary)' : 'transparent',
              color: isEnfant ? 'white' : 'var(--muted-foreground)',
              border: isEnfant ? 'none' : '1px solid var(--border)',
            }}
          >
            🎓 Enfant
          </Link>
        </nav>
      </div>
    </header>
  )
}
