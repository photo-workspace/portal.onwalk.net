import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPublicVideos } from '@/lib/video'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd'

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    const videos = await getPublicVideos()
    return videos.map((video) => ({
        slug: video.slug,
    }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const videos = await getPublicVideos()
    const video = videos.find((v) => v.slug === slug)

    if (!video) {
        return {
            title: 'Video Not Found',
        }
    }

    const title = video.title || video.slug
    const description = video.location
        ? `Video taken at ${Array.isArray(video.location) ? video.location.join(', ') : video.location}`
        : `Video: ${title}`

    return {
        title: `${title} | Onwalk`,
        description,
        openGraph: {
            title,
            description,
            type: 'video.other',
            videos: [{ url: video.src || '', width: 1280, height: 720 }],
            images: video.poster ? [{ url: video.poster }] : [],
        },
        alternates: {
            canonical: `/videos/${video.slug}`,
        },
    }
}

export default async function VideoPage({ params }: Props) {
    const { slug } = await params
    const videos = await getPublicVideos()
    const video = videos.find((v) => v.slug === slug)

    if (!video) {
        notFound()
    }

    // Ensure these are absolute URLs for Schema.org
    // Assuming src/poster are relative path or full URL. 
    // If they are relative like /videos/..., we might need to prepend base URL if not already there, 
    // but Schema usually prefers absolute. 
    // However, the user request says "embedUrl: NEXT_PUBLIC_MEDIA_BASE_URL + path"
    // In `lib/mediaListing.ts`, `src` is already constructed as `${baseUrl}/${item.path}`.

    const videoData = {
        title: video.title || video.slug,
        description: video.location
            ? `Location: ${Array.isArray(video.location) ? video.location.join(', ') : video.location}`
            : `Video content: ${video.title || video.slug}`,
        thumbnailUrl: video.poster || '', // formatted as absolute in lib
        uploadDate: video.updatedAt || new Date().toISOString(), // Fallback if missing
        contentUrl: video.src || '', // formatted as absolute in lib
        embedUrl: video.src || '', // Using direct link as embedUrl per user request/nature of these files
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: videoData.title,
        description: videoData.description,
        thumbnailUrl: [videoData.thumbnailUrl],
        uploadDate: videoData.uploadDate,
        contentUrl: videoData.contentUrl,
        embedUrl: videoData.embedUrl,
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <SiteHeader />

            <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
                <BreadcrumbJsonLd items={[
                    { name: 'Home', path: '/' },
                    { name: 'Videos', path: '/videos' },
                    { name: videoData.title || 'Video', path: `/videos/${slug}` }
                ]} />
                {/* JSON-LD for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                <div className="w-full mb-6">
                    <Link href="/videos" className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 mb-4">
                        ← Back to Videos
                    </Link>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{videoData.title}</h1>
                    {video.location && (
                        <p className="text-slate-500 text-sm">
                            📍 {Array.isArray(video.location) ? video.location.join(', ') : video.location}
                        </p>
                    )}
                </div>

                <div className="w-full bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative">
                    <video
                        src={video.src}
                        poster={video.poster}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                    />
                </div>

                <div className="w-full mt-8 max-w-3xl">
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 border-t border-slate-200 pt-4">
                        {video.updatedAt && (
                            <span>📅 Uploaded: {new Date(video.updatedAt).toLocaleDateString()}</span>
                        )}
                        {video.views !== undefined && (
                            <span>👁️ Views: {video.views}</span>
                        )}
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    )
}
