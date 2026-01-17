/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import Link from 'next/link'

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import PageHeader from '@/components/onwalk/PageHeader'
import type { ContentItem } from '@/lib/content'

type ImagesGalleryProps = {
  items: ContentItem[]
  currentPage: number
  totalPages: number
  totalImages: number
}

const formatImageTitle = (value?: string) => value?.replace(/[-_]+/g, ' ').trim()

function isLocalImage(src: string) {
  return src.startsWith('/') && !src.startsWith('//')
}

function buildPageHref(page: number) {
  if (page <= 1) {
    return '/images'
  }

  return `/images/${page}`
}

export default function ImagesGallery({
  items,
  currentPage,
  totalPages,
  totalImages,
}: ImagesGalleryProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <PageHeader variant="image" />
        <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              暂无图片，请将图片上传到 R2 的 images/ 目录下。若需使用本地 public/images/ 调试，请设置
              ENABLE_LOCAL_MEDIA_FALLBACK=true。
            </div>
          ) : (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [column-fill:_balance]">
              {items.map((item) => (
                <article
                  key={item.slug}
                  className="mb-6 break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)]"
                >
                  {item.cover ? (
                    isLocalImage(item.cover) ? (
                      <Image
                        src={item.cover}
                        alt={formatImageTitle(item.title) ?? item.slug}
                        width={1200}
                        height={800}
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="h-auto w-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.cover}
                        alt={formatImageTitle(item.title) ?? item.slug}
                        width={1200}
                        height={800}
                        className="h-auto w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    )
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                      图片缺失
                    </div>
                  )}
                  <div className="space-y-2 px-4 pb-4 pt-3">
                    <h2 className="text-base font-semibold text-slate-900">
                      {formatImageTitle(item.title) ?? item.slug}
                    </h2>
                    <p className="text-xs text-slate-500">公共图库 · {item.slug}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <div>
            第 {currentPage} / {totalPages} 页 · 共 {totalImages} 张
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildPageHref(currentPage - 1)}
              aria-disabled={currentPage <= 1}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                currentPage <= 1
                  ? 'cursor-not-allowed border-slate-200 text-slate-300'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900'
              }`}
            >
              上一页
            </Link>
            <Link
              href={buildPageHref(currentPage + 1)}
              aria-disabled={currentPage >= totalPages}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                currentPage >= totalPages
                  ? 'cursor-not-allowed border-slate-200 text-slate-300'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900'
              }`}
            >
              下一页
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
