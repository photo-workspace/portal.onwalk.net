export const dynamic = 'error'
export const revalidate = false

import ImageCarousel from '@/components/ImageCarousel'
import MasonryGrid from '@/components/MasonryGrid'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import VideoGrid from '@/components/VideoGrid'
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
        <section className="grid gap-8 rounded-[32px] border border-slate-200 bg-white/80 p-10 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
            <span className="rounded-full border border-slate-300 px-3 py-1">Index</span>
            <span>影像为入口 · 文字为结构</span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">一个可长期生长的影像与思想档案</h1>
          <p className="max-w-2xl text-sm text-slate-600">
            记录城市与山野的影像实践，让每一段图像有清晰的文字骨架。
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-slate-900 px-3 py-1 font-medium text-white">影像聚合</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Moments / Image</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Theater / Video</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Journal / Blog</span>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-semibold">行摄笔记</h2>
            <span className="text-xs text-slate-500">影像为入口，文字为结构</span>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <MasonryGrid posts={walk} />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-semibold">一图一文</h2>
            <span className="text-xs text-slate-500">胶片式浏览</span>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <ImageCarousel items={image} />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-semibold">一图一视频</h2>
            <span className="text-xs text-slate-500">剧场式观看</span>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <VideoGrid items={video} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
