'use client'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'
import type { ContentItem } from '@/lib/content'

export default function VideoGrid({ items }: { items: ContentItem[] }) {
  const copy = useOnwalkCopy()

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {item.src ? (
            <video
              src={item.src}
              poster={item.poster}
              muted
              loop
              playsInline
              className="h-48 w-full object-cover"
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
  )
}
