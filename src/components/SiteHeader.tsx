'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'
import { useLanguage } from '@/i18n/LanguageProvider'

export default function SiteHeader() {
  const copy = useOnwalkCopy()
  const { language, setLanguage } = useLanguage()
  const router = useRouter()
  const navItems = [
    { label: copy.header.nav.home, href: '/', prefetch: false },
    { label: copy.header.nav.image, href: '/images', prefetch: false },
    { label: copy.header.nav.video, href: '/videos', prefetch: false },
    { label: copy.header.nav.blog, href: '/blogs', prefetch: false },
    { label: copy.header.nav.about, href: '/about', prefetch: false },
  ]

  const handleLanguageChange = (nextLanguage: 'zh' | 'en') => {
    setLanguage(nextLanguage)
    window.location.reload()
  }

  return (
    <header className="hidden md:flex sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-heading">
          <span className="material-symbols-outlined text-primary">photo_camera</span>
          <span className="logo-text">{copy.header.title}</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={item.prefetch}
                className="text-text-secondary transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="h-4 w-[1px] bg-border"></div>
          <div className="flex items-center rounded-full border border-border bg-surface-elevated p-1">
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${language === 'en'
                  ? 'bg-surface text-heading shadow-sm ring-1 ring-border'
                  : 'text-text-secondary hover:text-text'
                }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('zh')}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${language === 'zh'
                  ? 'bg-surface text-heading shadow-sm ring-1 ring-border'
                  : 'text-text-secondary hover:text-text'
                }`}
            >
              中文
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
