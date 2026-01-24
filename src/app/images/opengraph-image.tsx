import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = {
    width: 1200,
    height: 630,
}

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ fontSize: 80, fontWeight: 900, color: 'black' }}>Onwalk</div>
                <div style={{ fontSize: 40, color: '#666', marginTop: 20 }}>Photography Gallery</div>
            </div>
        ),
        { ...size }
    )
}
