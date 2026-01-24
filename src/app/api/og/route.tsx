import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getPublicVideos } from '@/lib/video'
import { getImageItems } from '@/app/images/image-data'
import { getContent } from '@/lib/content'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const slugParam = searchParams.get('slug')

    if (!type || !slugParam) {
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        fontSize: 32,
                        fontWeight: 600,
                    }}
                >
                    <div>Onwalk</div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    }

    // slugParam might be URL encoded? searchParams handles it.
    // slugParam is raw string. My libraries expect...
    // getPublicVideos -> returns all, then we find match.
    // slug passed in might be "china/jiangsu/vlog".

    const titleFont = {
        fontSize: 60,
        fontWeight: 900 as const, // Cast to valid weight
        color: 'black',
        lineHeight: 1.1,
    }

    try {
        if (type === 'video') {
            const videos = await getPublicVideos()
            const video = videos.find(v => v.slug === slugParam)

            if (video) {
                const title = video.title || 'Video'
                const location = Array.isArray(video.location) ? video.location.join(', ') : video.location

                return new ImageResponse(
                    (
                        <div
                            style={{
                                background: 'black',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                            }}
                        >
                            {video.poster && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={video.poster.startsWith('http') ? video.poster : `https://www.onwalk.net${video.poster}`}
                                    alt={title}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        opacity: 0.6,
                                    }}
                                />
                            )}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    padding: '60px',
                                }}
                            >
                                <div style={{ fontSize: 24, color: '#ddd', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Onwalk Video
                                </div>
                                <div style={{ fontSize: 64, fontWeight: 900, color: 'white', marginBottom: 20 }}>
                                    {title}
                                </div>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', color: '#ccc', fontSize: 28 }}>
                                    {location && <span>📍 {location}</span>}
                                </div>
                            </div>
                        </div>
                    ),
                    { width: 1200, height: 630 }
                )
            }
        }

        if (type === 'image') {
            const items = await getImageItems()
            const item = items.find(i => i.slug === slugParam)

            if (item) {
                const title = item.title || 'Image'
                const location = Array.isArray(item.location) ? item.location.join(', ') : item.location

                return new ImageResponse(
                    (
                        <div
                            style={{
                                background: '#f0f0f0',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        >
                            <div style={{ width: '60%', height: '100%', display: 'flex' }}>
                                {item.cover && (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={item.cover.startsWith('http') ? item.cover : `https://www.onwalk.net${item.cover}`}
                                        alt={title}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                )}
                            </div>
                            <div style={{
                                width: '40%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                padding: '40px',
                                background: 'white'
                            }}>
                                <div style={{ fontSize: 20, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Onwalk Photography
                                </div>
                                <div style={{ fontSize: 48, fontWeight: 900, color: 'black', marginBottom: 20 }}>
                                    {title}
                                </div>
                                {location && <div style={{ fontSize: 24, color: '#555' }}>📍 {location}</div>}
                            </div>
                        </div>
                    ),
                    { width: 1200, height: 630 }
                )
            }
        }

        if (type === 'blog') {
            const posts = await getContent('blog')
            const post = posts.find(p => p.slug === slugParam)

            if (post) {
                const title = post.title || 'Blog Post'
                return new ImageResponse(
                    (
                        <div
                            style={{
                                background: 'white',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '60px',
                                position: 'relative',
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'linear-gradient(to bottom left, #eee 0%, transparent 50%)' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ fontSize: 24, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Onwalk Article
                                </div>
                                <div style={{ fontSize: 72, fontWeight: 900, color: 'black', maxWidth: '90%' }}>
                                    {title}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div style={{ display: 'flex', gap: '40px', fontSize: 28, color: '#555' }}>
                                    {post.date && <span>📅 {new Date(post.date).toLocaleDateString()}</span>}
                                    {post.category && <span>🏷️ {post.category}</span>}
                                </div>

                                <div style={{ fontSize: 32, fontWeight: 'bold', color: 'black' }}>
                                    onwalk.net
                                </div>
                            </div>
                        </div>
                    ),
                    { width: 1200, height: 630 }
                )
            }
        }

    } catch (e) {
        console.error(e)
    }

    // Default Fallback
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
                <div style={{ fontSize: 60, fontWeight: 900, color: 'black' }}>Onwalk</div>
                {slugParam && <div style={{ fontSize: 30, color: '#999', marginTop: 20 }}>{type} / {slugParam}</div>}
            </div>
        ),
        { width: 1200, height: 630 }
    )
}
