'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { ContentItem } from '@/lib/content'
import MediaDetailModal from './MediaDetailModal'

export default function ImageCarousel({ items }: { items: ContentItem[] }) {
  const galleryItems: Array<ContentItem & { tone?: string }> = items
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)

  return (
    <>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 pt-2">
        {galleryItems.map((item) => (
          <article
            key={item.slug}
            className="group relative flex h-[300px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm cursor-pointer"
            style={{ aspectRatio: '3 / 4' }}
            onClick={() => setSelectedItem(item)}
          >
            {item.cover ? (
              <Image
                src={item.cover}
                alt={item.title ?? item.slug}
                width={450}
                height={600}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 75vw, 300px" // Adjusted sizes for carousel items
              />
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${item.tone ?? 'from-slate-200 via-slate-100 to-slate-50'}`} />
            )}
            <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
              <span className="inline-flex rounded-full bg-surface-translucent px-3 py-1 text-xs font-medium text-text backdrop-blur">
                {item.title}
              </span>
            </div>
          </article>
        ))}
        <Link
          href="/images"
          className="group flex h-[300px] flex-shrink-0 snap-start items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted px-6 text-center text-sm font-medium text-text transition hover:bg-surface-elevated"
          style={{ aspectRatio: '3 / 4' }}
        >
          <span className="leading-relaxed">查看全部</span>
        </Link>
      </div>

      {selectedItem && (
        <MediaDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          type="image"
        />
      )}
    </>
  )
}
