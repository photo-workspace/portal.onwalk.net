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
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ fontSize: 80, fontWeight: 900, color: 'white' }}>Onwalk</div>
                <div style={{ fontSize: 40, color: '#aaa', marginTop: 20 }}>Video Collection</div>
            </div>
        ),
        { ...size }
    )
}
