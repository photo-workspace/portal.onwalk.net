'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'
import type { ContentItem } from '@/lib/content'

const PAGE_SIZE = 12

type VideoGridVariant = 'overview' | 'full'
type VideoGridColumns = 2 | 3

function isLocalImage(src: string) {
  return src.startsWith('/') && !src.startsWith('//')
}

export default function VideoGrid({
  items,
  variant = 'full',
  columns = 2,
}: {
  items: ContentItem[]
  variant?: VideoGridVariant
  columns?: VideoGridColumns
}) {
  const copy = useOnwalkCopy()
  const videoItems = items
  const [pageIndex, setPageIndex] = useState(0)
  const totalPages = Math.max(1, Math.ceil(videoItems.length / PAGE_SIZE))
  const clampedPageIndex = Math.min(pageIndex, totalPages - 1)
  const pagedItems = useMemo(() => {
    const start = clampedPageIndex * PAGE_SIZE
    return videoItems.slice(start, start + PAGE_SIZE)
  }, [videoItems, clampedPageIndex])

  const currentItems = variant === 'overview' ? videoItems.slice(0, 4) : pagedItems
  const canGoBack = clampedPageIndex > 0
  const canGoForward = clampedPageIndex < totalPages - 1

  return (
    <div className="space-y-8">
      <div className={`grid gap-6 ${columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {currentItems.map((item) => (
          <div
            key={item.slug}
            className="overflow-hidden rounded-2xl border border-[#efefef] bg-white shadow-[0_4px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="relative">
              {item.src ? (
                <video
                  src={item.src}
                  poster={item.poster}
                  controls
                  loop
                  playsInline
                  className="h-48 w-full object-cover sm:h-56"
                  onMouseEnter={(event) => event.currentTarget.play()}
                  onMouseLeave={(event) => event.currentTarget.pause()}
                />
              ) : item.poster ? (
                isLocalImage(item.poster) ? (
                  <Image
                    src={item.poster}
                    alt={item.title ?? item.slug}
                    width={1280}
                    height={720}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="h-48 w-full object-cover sm:h-56"
                  />
                ) : (
                  <img
                    src={item.poster}
                    alt={item.title ?? item.slug}
                    width={1280}
                    height={720}
                    className="h-48 w-full object-cover sm:h-56"
                    loading="lazy"
                    decoding="async"
                  />
                )
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-[#747775]">{copy.video.empty}</div>
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/30 text-white shadow-sm backdrop-blur-md">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white">
                {item.duration ?? '04:20'}
              </span>
            </div>
            <div className="space-y-1 p-4">
              <Link href="/videos" className="text-sm font-medium text-[#1f1f1f] hover:text-[#1f1f1f]">
                {item.title ?? item.slug}
              </Link>
              {item.location && <p className="text-xs text-[#747775]">{item.location}</p>}
            </div>
          </div>
        ))}
      </div>
      {variant === 'full' && (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[#747775]">
          <span>
            {copy.video.pageLabel ?? 'Page'} {clampedPageIndex + 1} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[#1f1f1f] transition hover:border-[#d8d8d8] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPageIndex(Math.max(0, clampedPageIndex - 1))}
              disabled={!canGoBack}
            >
              {copy.video.prev ?? '上一页'}
            </button>
            <button
              type="button"
              className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[#1f1f1f] transition hover:border-[#d8d8d8] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPageIndex(Math.min(totalPages - 1, clampedPageIndex + 1))}
              disabled={!canGoForward}
            >
              {copy.video.next ?? '下一页'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
