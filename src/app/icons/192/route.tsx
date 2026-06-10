import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          borderRadius: 43,
          background: '#2E7D6B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="110" height="110" viewBox="-13 -13 26 26">
          <path
            d="M0 -13 L3.2 -4 L12.5 -4 L5 1.8 L8 11 L0 5.2 L-8 11 L-5 1.8 L-12.5 -4 L-3.2 -4 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
