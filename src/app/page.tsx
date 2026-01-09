export const dynamic = 'error'
export const revalidate = false

import ImageCarousel from '@/components/ImageCarousel'
import MasonryGrid from '@/components/MasonryGrid'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import VideoGrid from '@/components/VideoGrid'
import HomeHero from '@/components/onwalk/HomeHero'
import HomeSectionHeader from '@/components/onwalk/HomeSectionHeader'
import { getContent } from '@/lib/content'

export default async function HomePage() {
  const [walk, image, video] = await Promise.all([
    getContent('walk'),
    getContent('image'),
    getContent('video'),
  ])

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_80%_0,rgba(253,224,71,0.18),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(148,163,184,0.2),transparent_35%)]" aria-hidden />
      <SiteHeader />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24">
        <HomeHero />

        <section className="space-y-6">
          <HomeSectionHeader section="blog" />
          <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <MasonryGrid posts={walk} />
          </div>
        </section>

        <section className="space-y-6">
          <HomeSectionHeader section="image" />
          <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <ImageCarousel items={image} />
          </div>
        </section>

        <section className="space-y-6">
          <HomeSectionHeader section="video" />
          <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <VideoGrid items={video} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
