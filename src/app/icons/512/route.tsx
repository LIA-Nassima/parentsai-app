import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          borderRadius: 115,
          background: '#2E7D6B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="290" height="290" viewBox="-13 -13 26 26">
          <path
            d="M0 -13 L3.2 -4 L12.5 -4 L5 1.8 L8 11 L0 5.2 L-8 11 L-5 1.8 L-12.5 -4 L-3.2 -4 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
