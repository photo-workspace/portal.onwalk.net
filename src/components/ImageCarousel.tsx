import Image from 'next/image'
import type { ContentItem } from '@/lib/content'

const blurDataURL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyM2I0YmUiLz48L3N2Zz4='

import Link from 'next/link'

export default function ImageCarousel({ items }: { items: ContentItem[] }) {
  return (
    <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 scrollbar-hide">
      {items.map((item) => (
        <article
          key={item.slug}
          className="group relative h-[300px] w-auto flex-shrink-0 snap-center overflow-hidden rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] shadow-sm transition-shadow hover:shadow-md"
          style={{ aspectRatio: '3/4' }}
        >
          {item.cover && (
            <div className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl">
              <Image
                src={item.cover}
                alt={item.title ?? item.slug}
                fill
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <h3 className="text-sm font-medium">{item.title}</h3>
            {item.equipment && <p className="mt-1 text-xs opacity-80">{item.equipment}</p>}
          </div>
        </article>
      ))}
      {/* See All Card */}
      <Link
        href="/images"
        className="flex h-[300px] w-auto flex-shrink-0 snap-center flex-col items-center justify-center rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-6 text-[var(--color-text)] shadow-sm transition-colors hover:bg-[var(--color-surface-muted)]"
        style={{ aspectRatio: '3/4' }}
      >
        <span className="text-lg font-medium">View All</span>
        <span className="mt-2 text-sm text-[var(--color-text-muted)]">Explore Gallery</span>
      </Link>
    </div>
  )
}
