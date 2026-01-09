import Link from 'next/link'

type SubNavItem = {
  label: string
  href: string
}

export default function SubNav({ items, activeHref }: { items: SubNavItem[]; activeHref?: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
      {items.map((item) => {
        const isActive = activeHref === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 transition ${
              isActive ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
