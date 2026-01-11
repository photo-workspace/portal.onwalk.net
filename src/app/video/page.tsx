export const dynamic = 'force-dynamic'
export const revalidate = 0

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import VideoGrid from '@/components/VideoGrid'
import PageHeader from '@/components/onwalk/PageHeader'
import { getContent } from '@/lib/content'

export default async function VideoPage() {
  const videos = await getContent('video')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <PageHeader variant="video" />
        <VideoGrid items={videos} />
      </main>
      <SiteFooter />
    </div>
  )
}
