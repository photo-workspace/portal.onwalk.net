'use client'

import { useEffect, useMemo, useState } from 'react'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'
import type { ContentItem } from '@/lib/content'

const PAGE_SIZE = 12

export default function VideoGrid({ items }: { items: ContentItem[] }) {
  const copy = useOnwalkCopy()
  const [pageIndex, setPageIndex] = useState(0)
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const currentItems = useMemo(() => {
    const start = pageIndex * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, pageIndex])

  const canGoBack = pageIndex > 0
  const canGoForward = pageIndex < totalPages - 1

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1))
    }
  }, [pageIndex, totalPages])

  return (
    <div className="space-y-8">
      <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
        {currentItems.map((item) => (
          <div
            key={item.slug}
            className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {item.src ? (
              <video
                src={item.src}
                poster={item.poster}
                muted
                loop
                playsInline
                className="h-auto w-full object-cover"
                onMouseEnter={(event) => event.currentTarget.play()}
                onMouseLeave={(event) => event.currentTarget.pause()}
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-slate-500">{copy.video.empty}</div>
            )}
            <div className="p-4 text-slate-900">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.location && <p className="mt-1 text-xs text-slate-500">{item.location}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
        <span>
          {copy.video.pageLabel ?? 'Page'} {pageIndex + 1} / {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
            disabled={!canGoBack}
          >
            {copy.video.prev ?? '上一页'}
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={!canGoForward}
          >
            {copy.video.next ?? '下一页'}
          </button>
        </div>
      </div>
    </div>
  )
}
