import Link from 'next/link'

const navItems = [
  { label: '首页', href: '/' },
  { label: '一图一文', href: '/image' },
  { label: '一图一视频', href: '/video' },
  { label: '行摄笔记', href: '/blog' },
  { label: '关于', href: '/about' },
]

export default function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-10">
      <Link href="/" className="text-lg font-semibold tracking-[0.18em] text-slate-900">
        行者影像档案
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
