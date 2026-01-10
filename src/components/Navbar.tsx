'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'
import LanguageToggle from './LanguageToggle'
import { AskAIButton } from './AskAIButton'
// import SearchComponent from './search'

export default function Navbar() {
  const pathname = usePathname()
  const isHiddenRoute = pathname
    ? ['/xstream', '/xcloudflow', '/xscopehub', '/blog'].some((prefix) =>
        pathname.startsWith(prefix),
      )
    : false
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
  const { language } = useLanguage()

  const isChinese = language === 'zh'
  const labels = {
    home: isChinese ? '首页' : 'Home',
    download: isChinese ? '博客' : 'blog',
    openSource: isChinese ? '开源项目' : 'Open source',
    editor: isChinese ? '编辑器' : 'Editor',
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const element = navRef.current
    if (!element) {
      return
    }

    const updateOffset = () => {
      const height = element.getBoundingClientRect().height
      document.documentElement.style.setProperty('--app-shell-nav-offset', `${height}px`)
    }

    updateOffset()

    const resizeObserver = new ResizeObserver(() => {
      updateOffset()
    })

    resizeObserver.observe(element)
    window.addEventListener('resize', updateOffset)

    return () => {
      window.removeEventListener('resize', updateOffset)
      resizeObserver.disconnect()
    }
  }, [])

  const mainLinks = [
    { key: 'home', label: labels.home, href: '/' },
  ]

  const downloadLink = { key: 'blog', label: labels.download, href: '/blog' }

  const editorLink = {
    key: 'editor',
    label: labels.editor,
    href: 'https://write.svc.plus/',
  }

  const openSourceProjects = [
    { key: 'xstream', label: 'XStream', href: '/xstream' },
    { key: 'xcloudflow', label: 'XCloudFlow', href: '/xcloudflow' },
    { key: 'xscopehub', label: 'XScopeHub', href: '/xscopehub' },
  ]

  if (isHiddenRoute) {
    return null
  }

  return (
    <>
      <nav
        ref={navRef}
        className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/95 text-slate-100 backdrop-blur"
      >
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
          <div className="flex items-center gap-5 py-3">
            <div className="flex flex-1 items-center gap-5">
              <Link href="/" className="flex items-center gap-2 rounded-md border border-white/5 bg-slate-900/60 px-2.5 py-1.5 text-sm font-medium text-white/90 transition hover:bg-slate-800/60">
                <Image
                  src="/icons/cloudnative_32.png"
                  alt="logo"
                  width={24}
                  height={24}
                  className="h-[20px] w-[20px] opacity-90"
                  unoptimized
                />
                <span className="text-sm font-medium opacity-90">Cloud-Neutral</span>
                <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-200">
                  Default config
                </span>
              </Link>
              <div className="hidden items-center gap-5 text-sm font-medium text-slate-200 lg:flex">
                {mainLinks.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="text-sm opacity-80 transition hover:text-white hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  key={downloadLink.key}
                  href={downloadLink.href}
                  className="text-sm opacity-80 transition hover:text-white hover:opacity-100"
                >
                  {downloadLink.label}
                </Link>
                <div className="group relative">
                  <button className="flex items-center gap-1 text-sm opacity-80 transition hover:text-white hover:opacity-100">
                    <span>{labels.openSource}</span>
                    <svg
                      className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 top-full hidden min-w-[200px] translate-y-1 rounded-lg border border-white/10 bg-slate-900/95 py-2 text-sm text-slate-100 opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all duration-200 group-hover:block group-hover:translate-y-2 group-hover:opacity-100 group-focus-within:block group-focus-within:translate-y-2 group-focus-within:opacity-100">
                    {openSourceProjects.map((project) => (
                      <Link
                        key={project.key}
                        href={project.href}
                        className="block px-4 py-2 text-sm opacity-80 transition hover:bg-indigo-500/10 hover:text-white hover:opacity-100"
                      >
                        {project.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link
                  key={editorLink.key}
                  href={editorLink.href}
                  className="text-sm opacity-80 transition hover:text-white hover:opacity-100"
                >
                  {editorLink.label}
                </Link>
              </div>
            </div>

            <div className="hidden flex-1 items-center justify-end gap-4 lg:flex">
              {/* <SearchComponent className="relative w-full max-w-xs" /> */}
              {/* Mail feature temporarily disabled */}
              <LanguageToggle />
            </div>

            <button
              className="flex items-center text-slate-100 focus:outline-none lg:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {menuOpen ? (
            <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:hidden">
              <div className="flex flex-col gap-4 border-t border-white/10 bg-slate-900/80 py-3 text-slate-100">
                {/*
                <SearchComponent
                  className="relative"
                  buttonClassName="h-8 w-8"
                  inputClassName="py-2 pr-12"
                />
                */}
                <div className="flex flex-col gap-2 text-sm font-medium">
                  {mainLinks.map((link) => (
                    <Link
                      key={link.key}
                      href={link.href}
                      className="py-2 text-sm opacity-80 transition hover:opacity-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    key={editorLink.key}
                    href={editorLink.href}
                    className="py-2 text-sm opacity-80 transition hover:opacity-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    {editorLink.label}
                  </Link>
                </div>
                <div className="flex flex-col gap-2">
                  <LanguageToggle />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </nav>

      <AskAIButton />

    </>
  )
}
