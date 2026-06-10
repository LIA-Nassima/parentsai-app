import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#2E7D6B',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="105" height="105" viewBox="-13 -13 26 26">
          <path
            d="M0 -13 L3.2 -4 L12.5 -4 L5 1.8 L8 11 L0 5.2 L-8 11 L-5 1.8 L-12.5 -4 L-3.2 -4 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
