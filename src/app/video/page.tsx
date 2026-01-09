export const dynamic = 'error'
export const revalidate = false

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import VideoGrid from '@/components/VideoGrid'
import { getContent } from '@/lib/content'

export default async function VideoPage() {
  const videos = await getContent('video')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <header className="space-y-3 pb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">一图一视频</p>
          <h1 className="text-3xl font-semibold">影像剧场</h1>
          <p className="text-sm text-slate-600">通过短片补充照片的呼吸与节奏。</p>
        </header>
        <VideoGrid items={videos} />
      </main>
      <SiteFooter />
    </div>
  )
}
