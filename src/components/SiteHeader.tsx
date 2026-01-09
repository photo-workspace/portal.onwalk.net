'use client'

import Link from 'next/link'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'

export default function SiteHeader() {
  const copy = useOnwalkCopy()
  const navItems = [
    { label: copy.header.nav.home, href: '/' },
    { label: copy.header.nav.image, href: '/image' },
    { label: copy.header.nav.video, href: '/video' },
    { label: copy.header.nav.blog, href: '/blog' },
    { label: copy.header.nav.about, href: '/about' },
  ]

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-10">
      <Link href="/" className="text-lg font-semibold tracking-[0.18em] text-slate-900">
        {copy.header.title}
      </Link>
      <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="transition hover:text-slate-900">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
