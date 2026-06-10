interface Props {
  size?: number
  dark?: boolean  // false = sur fond vert (texte blanc) ; true = sur fond clair (texte sapin)
}

export function LogoIAla({ size = 32, dark = false }: Props) {
  const couleurTexte = dark ? '#2E7D6B' : '#fff'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', lineHeight: 1, color: couleurTexte }}>
      <span style={{
        fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '-0.02em',
      }}>
        IA
      </span>
      <span style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: 'var(--font-dancing), cursive',
        fontWeight: 700,
        fontSize: size * 1.1,
        marginLeft: size * 0.03,
      }}>
        la
        {/* étoile rouge — remplace l'accent sur le à */}
        <svg
          width={size * 0.28}
          height={size * 0.28}
          viewBox="-12 -12 24 24"
          style={{ position: 'absolute', top: -size * 0.08, right: -size * 0.08 }}
        >
          <path
            d="M0 -9.5 L2.3 -2.9 L9.2 -2.9 L3.6 1.3 L5.7 8 L0 3.8 L-5.7 8 L-3.6 1.3 L-9.2 -2.9 L-2.3 -2.9 Z"
            fill="#D9483B"
          />
        </svg>
      </span>
    </span>
  )
}
