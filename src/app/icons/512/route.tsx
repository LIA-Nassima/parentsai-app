import { ImageResponse } from 'next/og'

// Icône PWA 512x512 — référencée dans le manifest (maskable = s'adapte au fond Android)
export function GET() {
  return new ImageResponse(
    <div
      style={{
        background: '#2e3b4e',
        width: 512,
        height: 512,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ color: 'white', fontSize: 220, fontWeight: 'bold', fontFamily: 'serif', lineHeight: 1 }}>
          P
        </span>
        <span style={{ color: '#c9543a', fontSize: 110, fontWeight: 'bold', fontFamily: 'serif' }}>
          AI
        </span>
      </div>
      <span
        style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 38,
          letterSpacing: 10,
          fontFamily: 'sans-serif',
          marginTop: -8,
        }}
      >
        PARENTS
      </span>
    </div>,
    { width: 512, height: 512 }
  )
}
