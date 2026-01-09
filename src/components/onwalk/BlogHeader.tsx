'use client'

import Link from 'next/link'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'

type BlogHeaderVariant = 'overview' | 'tracks' | 'city' | 'scenery'

export default function BlogHeader({ variant, activeHref }: { variant: BlogHeaderVariant; activeHref: string }) {
  const copy = useOnwalkCopy()

  const headerMap = {
    overview: copy.blog.overview,
    tracks: copy.blog.sections.tracks,
    city: copy.blog.sections.city,
    scenery: copy.blog.sections.scenery,
  }

  const header = headerMap[variant]
  const navItems = [
    { label: copy.blog.categories.tracks, href: '/blog/Tracks' },
    { label: copy.blog.categories.city, href: '/blog/City' },
    { label: copy.blog.categories.scenery, href: '/blog/Scenery' },
  ]

  return (
    <header className="space-y-4 pb-10">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{header.eyebrow}</p>
      <h1 className="text-3xl font-semibold">{header.title}</h1>
      <p className="text-sm text-slate-600">{header.subtitle}</p>
      <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        {navItems.map((item) => {
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
    </header>
  )
}
