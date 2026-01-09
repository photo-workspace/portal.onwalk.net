export const dynamic = 'error'
export const revalidate = false

import Image from 'next/image'

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { getContent } from '@/lib/content'
import { renderMarkdownContent } from '@/server/render-markdown'

const blurDataURL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMjM1NDQiLz48L3N2Zz4='

export default async function ImagePage() {
  const images = await getContent('image')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 pb-20">
        <header className="space-y-3 pb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">一图一文</p>
          <h1 className="text-3xl font-semibold">以影像为入口的单页阅读</h1>
          <p className="text-sm text-slate-600">每一张照片对应一段文字，让图像延续成叙事。</p>
        </header>
        <div className="space-y-24">
          {images.map((img) => (
            <article key={img.slug} className="space-y-4">
              {img.cover && (
                <Image
                  src={img.cover}
                  alt={img.title ?? img.slug}
                  width={1600}
                  height={1000}
                  className="h-auto w-full rounded-2xl object-cover"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                />
              )}
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{img.title}</h2>
                <div className="text-xs text-slate-500">
                  {img.equipment}
                  {img.location ? ` · ${img.location}` : ''}
                </div>
              </div>
              {img.content && (
                <div
                  className="prose max-w-none text-sm leading-relaxed prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownContent(img.content) }}
                />
              )}
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
