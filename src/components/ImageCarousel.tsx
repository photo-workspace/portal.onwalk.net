import Link from 'next/link'
import type { ContentItem } from '@/lib/content'

export default function ImageCarousel({ items }: { items: ContentItem[] }) {
  const galleryItems: Array<ContentItem & { tone?: string }> = items

  return (
    <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 pt-2">
      {galleryItems.map((item) => (
        <article
          key={item.slug}
          className="group relative flex h-[300px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#efefef] bg-white shadow-[0_4px_8px_rgba(0,0,0,0.04)]"
          style={{ aspectRatio: '3 / 4' }}
        >
          {item.cover ? (
            <img
              src={item.cover}
              alt={item.title ?? item.slug}
              width={900}
              height={1200}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${item.tone ?? 'from-slate-200 via-slate-100 to-slate-50'}`} />
          )}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
            <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[#1f1f1f] backdrop-blur">
              {item.title}
            </span>
          </div>
        </article>
      ))}
      <Link
        href="/images"
        className="group flex h-[300px] flex-shrink-0 snap-start items-center justify-center rounded-2xl border border-dashed border-[#e4e4e4] bg-[#f5f5f5] px-6 text-center text-sm font-medium text-[#1f1f1f] transition hover:bg-[#f2f2f2]"
        style={{ aspectRatio: '3 / 4' }}
      >
        <span className="leading-relaxed">查看全部</span>
      </Link>
    </div>
  )
}
