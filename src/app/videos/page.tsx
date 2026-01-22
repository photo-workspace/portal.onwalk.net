import type { Metadata } from 'next'

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import VideoGrid from '@/components/VideoGrid'
import PageHeader from '@/components/onwalk/PageHeader'
import { getPublicVideos } from '@/lib/video'

export const metadata: Metadata = {
  title: '视频 | Onwalk',
  description: 'Onwalk 视频集，记录户外、航拍与行走的影像故事。',
  alternates: {
    canonical: '/videos',
  },
  openGraph: {
    title: '视频 | Onwalk',
    description: 'Onwalk 视频集，记录户外、航拍与行走的影像故事。',
    url: 'https://www.onwalk.net/videos',
    siteName: 'Onwalk',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '视频 | Onwalk',
    description: 'Onwalk 视频集，记录户外、航拍与行走的影像故事。',
  },
}

export default async function VideosPage() {
  const videos = await getPublicVideos()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <PageHeader variant="video" />
        <VideoGrid items={videos} columns={3} />
      </main>
      <SiteFooter />
    </div>
  )
}
