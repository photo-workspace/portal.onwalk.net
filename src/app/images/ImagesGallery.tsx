'use client'

/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import Link from 'next/link'
import { useState, useMemo } from 'react'

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import PageHeader from '@/components/onwalk/PageHeader'
import type { ContentItem } from '@/lib/content'
import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'
import { copyToClipboard } from '@/lib/clipboard'
import MediaDetailModal from '@/components/MediaDetailModal'

type ImagesGalleryProps = {
  items: ContentItem[]
  currentPage?: number
  totalPages?: number
  totalImages?: number
  initialSlug?: string
}

const PAGE_SIZE = 12

const formatImageTitle = (value?: string) => value?.replace(/[-_]+/g, ' ').trim()

const formatTime = (isoString?: string) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString()
}

function isLocalImage(src: string) {
  return src.startsWith('/') && !src.startsWith('//')
}



export default function ImagesGallery({
  items,
  currentPage,
  totalPages: externalTotalPages,
  totalImages: externalTotalImages,
  initialSlug
}: ImagesGalleryProps) {
  const copy = useOnwalkCopy()
  const [sort, setSort] = useState<'latest' | 'location' | 'views'>('latest')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [pageIndex, setPageIndex] = useState(currentPage ? currentPage - 1 : 0)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(() => {
    if (initialSlug) {
      return items.find(i => i.slug === initialSlug) || null
    }
    return null
  })

  const handleSort = (newSort: 'latest' | 'location' | 'views') => {
    if (sort === newSort) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSort(newSort)
      setSortDirection('desc') // Default to desc for new sort
    }
  }

  const handleCopyMarkdown = async (e: React.MouseEvent, item: ContentItem) => {
    e.preventDefault()
    e.stopPropagation()
    const baseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, '') || ''
    const markdown = `![${item.title ?? item.slug}](${baseUrl}/${item.slug})`
    console.log('[Debug] Generated Markdown:', markdown, 'BaseURL:', baseUrl, 'Slug:', item.slug)

    const success = await copyToClipboard(markdown)
    if (success) {
      console.log('Markdown copied successfully')
      setCopiedKey(item.slug)
      setTimeout(() => setCopiedKey(null), 2000)
    } else {
      console.error('Failed to copy markdown')
    }
  }

  const sortedItems = useMemo(() => {
    const list = [...items]
    let comparison = 0
    list.sort((a, b) => {
      if (sort === 'location') {
        const locA = Array.isArray(a.location) ? a.location.join(', ') : (a.location || '')
        const locB = Array.isArray(b.location) ? b.location.join(', ') : (b.location || '')
        comparison = locA.localeCompare(locB)
      } else if (sort === 'views') {
        comparison = (a.views || 0) - (b.views || 0)
      } else {
        // latest/date
        const tA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const tB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        comparison = tA - tB
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    return list
  }, [items, sort, sortDirection])

  // Reset page when order changes
  useMemo(() => {
    setPageIndex(0)
  }, [sort])

  const totalImages = externalTotalImages ?? sortedItems.length
  const totalPages = externalTotalPages ?? Math.max(1, Math.ceil(totalImages / PAGE_SIZE))
  const clampedPageIndex = Math.min(pageIndex, totalPages - 1)

  const currentItems = (externalTotalImages !== undefined)
    ? sortedItems // If we already have paged items, just use them
    : sortedItems.slice(clampedPageIndex * PAGE_SIZE, (clampedPageIndex + 1) * PAGE_SIZE)
  const canGoBack = clampedPageIndex > 0
  const canGoForward = clampedPageIndex < totalPages - 1

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <PageHeader variant="image" />

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-end gap-3 text-sm">
          <span className="text-slate-500 mr-2">排序:</span>
          <button
            onClick={() => handleSort('latest')}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${sort === 'latest' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            更新时间 {sort === 'latest' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('location')}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${sort === 'location' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            位置 {sort === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('views')}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${sort === 'views' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            访问量 {sort === 'views' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
          {currentItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              暂无图片，请将图片上传到 R2 的 images/ 目录下。若需使用本地 public/images/ 调试，请设置
              ENABLE_LOCAL_MEDIA_FALLBACK=true。
            </div>
          ) : (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [column-fill:_balance]">
              {currentItems.map((item) => (
                <article
                  key={item.slug}
                  className="group relative mb-6 break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)] cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <button
                    onClick={(e) => handleCopyMarkdown(e, item)}
                    title={copiedKey === item.slug ? copy.image.markdownCopied : copy.image.copyMarkdown}
                    className={`absolute right-3 top-3 z-10 hidden items-center justify-center rounded-full p-2 text-white backdrop-blur-md transition group-hover:flex ${copiedKey === item.slug ? 'bg-green-500/80 hover:bg-green-600/90' : 'bg-black/50 hover:bg-black/70'
                      }`}
                  >
                    {copiedKey === item.slug ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    )}
                  </button>
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
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {item.updatedAt && (
                        <span title="Update time">{formatTime(item.updatedAt)}</span>
                      )}
                      {item.location && (
                        <span title="Location" className="flex items-center gap-0.5">
                          📍 {item.location}
                        </span>
                      )}
                      {item.views && (
                        <span title="Views" className="flex items-center gap-0.5">
                          👁️ {item.views}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <div>
            第 {clampedPageIndex + 1} / {totalPages} 页 · 共 {totalImages} 张
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPageIndex(Math.max(0, clampedPageIndex - 1))}
              disabled={!canGoBack}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${!canGoBack
                ? 'cursor-not-allowed border-slate-200 text-slate-300'
                : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                }`}
            >
              上一页
            </button>
            <button
              onClick={() => setPageIndex(Math.min(totalPages - 1, clampedPageIndex + 1))}
              disabled={!canGoForward}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${!canGoForward
                ? 'cursor-not-allowed border-slate-200 text-slate-300'
                : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                }`}
            >
              下一页
            </button>
          </div>
        </div>
      </main>
      <SiteFooter />
      {/* Toast Notification */}
      <div
        className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-900 shadow-lg backdrop-blur transition-all duration-300 ${copiedKey ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          }`}
      >
        {copy.image.markdownCopied}
      </div>

      {selectedItem && (
        <MediaDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          type="image"
          onNext={() => {
            const currentIndex = sortedItems.findIndex(i => i.slug === selectedItem.slug)
            if (currentIndex < sortedItems.length - 1) {
              setSelectedItem(sortedItems[currentIndex + 1])
            }
          }}
          onPrev={() => {
            const currentIndex = sortedItems.findIndex(i => i.slug === selectedItem.slug)
            if (currentIndex > 0) {
              setSelectedItem(sortedItems[currentIndex - 1])
            }
          }}
          hasNext={sortedItems.findIndex(i => i.slug === selectedItem.slug) < sortedItems.length - 1}
          hasPrev={sortedItems.findIndex(i => i.slug === selectedItem.slug) > 0}
        />
      )}
    </div>
  )
}
