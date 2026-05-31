import { ImageResponse } from 'next/og'

// Icône Apple (180x180) — apparaît sur l'écran d'accueil iPhone/iPad
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: '#2e3b4e',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ color: 'white', fontSize: 88, fontWeight: 'bold', fontFamily: 'serif' }}>
          P
        </span>
        <span style={{ color: '#c9543a', fontSize: 44, fontWeight: 'bold', fontFamily: 'serif' }}>
          AI
        </span>
      </div>
    </div>,
    { ...size }
  )
}
