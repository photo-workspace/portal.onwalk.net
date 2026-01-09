import Image from 'next/image'
import type { ContentItem } from '@/lib/content'

const blurDataURL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyM2I0YmUiLz48L3N2Zz4='

export default function ImageCarousel({ items }: { items: ContentItem[] }) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {items.map((item) => (
        <article
          key={item.slug}
          className="min-w-[260px] max-w-[320px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm"
        >
          {item.cover && (
            <div className="overflow-hidden rounded-xl">
              <Image
                src={item.cover}
                alt={item.title ?? item.slug}
                width={800}
                height={520}
                className="h-52 w-full object-cover"
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
            </div>
          )}
          <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
          {item.equipment && <p className="mt-2 text-xs text-slate-500">{item.equipment}</p>}
        </article>
      ))}
    </div>
  )
}
