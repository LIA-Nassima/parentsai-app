type Variant = 'nonfait' | 'fait' | 'valide' | 'enattente'

const STYLES: Record<Variant, { bg: string; color: string; label: string }> = {
  nonfait:   { bg: '#FBE6E3', color: '#D9483B', label: 'Non fait' },
  fait:      { bg: '#E3F0EC', color: '#1F5A4D', label: 'Fait' },
  valide:    { bg: '#E3F0EC', color: '#1F5A4D', label: 'Validé ✓' },
  enattente: { bg: '#FDF8EA', color: '#B8881F', label: 'En attente' },
}

interface Props {
  variant: Variant
  label?: string
}

export function StatusBadge({ variant, label }: Props) {
  const s = STYLES[variant]
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {label ?? s.label}
    </span>
  )
}
