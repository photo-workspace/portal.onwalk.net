import Link from 'next/link'
import type { ContentItem } from '@/lib/content'

export default function HomeVideoGrid({ items }: { items: ContentItem[] }) {
  // Display only up to 4 items for the home page 2x2 grid
  const displayItems = items.slice(0, 4)

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {displayItems.map((item) => (
        <Link key={item.slug} href="/video" className="group block">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[var(--color-surface-border)] bg-gray-100 shadow-sm transition-all hover:shadow-md">
            {item.src ? (
              <video
                src={item.src}
                poster={item.poster}
                muted
                playsInline
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
                No Video
              </div>
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-100 transition-opacity group-hover:opacity-100">
               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white ml-0.5">
                   <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                 </svg>
               </div>
            </div>

            {/* Duration Badge (Mocked for now as duration isn't in ContentItem usually, or handled dynamically) */}
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              04:20
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-base font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">{item.title}</h3>
            {item.location && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{item.location}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}
