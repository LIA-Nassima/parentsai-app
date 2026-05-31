import { ImageResponse } from 'next/og'

// Favicon navigateur (32x32) — généré dynamiquement, aucun PNG à gérer
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#2e3b4e',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
      }}
    >
      <span style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>P</span>
    </div>,
    { ...size }
  )
}
