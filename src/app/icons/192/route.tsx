import { ImageResponse } from 'next/og'

// Icône PWA 192x192 — référencée dans le manifest pour Android/Chrome
export function GET() {
  return new ImageResponse(
    <div
      style={{
        background: '#2e3b4e',
        width: 192,
        height: 192,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ color: 'white', fontSize: 90, fontWeight: 'bold', fontFamily: 'serif' }}>
          P
        </span>
        <span style={{ color: '#c9543a', fontSize: 45, fontWeight: 'bold', fontFamily: 'serif' }}>
          AI
        </span>
      </div>
    </div>,
    { width: 192, height: 192 }
  )
}
