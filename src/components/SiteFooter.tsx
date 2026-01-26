'use client'
/* eslint-disable @next/next/no-img-element */

import { Twitter, Pin, Linkedin, Instagram } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'

export default function SiteFooter() {
  type SocialItem = {
    label: string
    icon: LucideIcon
    href?: string
    qrImage?: string
    qrAlt?: string
    qrHint?: string
  }

  const copy = useOnwalkCopy()

  const socials: SocialItem[] = [
    { label: 'X', href: 'https://x.com/OnWalkNotes', icon: Twitter },
    { label: 'Pinterest', href: 'https://pinterest.com/haitaopanhq/', icon: Pin },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/haitaopan/', icon: Linkedin },
    { label: 'Instagram', href: 'https://www.instagram.com/haitaopanhq/', icon: Instagram },

  ]

  return (
    <footer className="hidden md:block mx-auto w-full max-w-7xl px-6 pb-16 pt-16 text-sm text-text-muted transition-colors duration-300">
      <div className="flex flex-col gap-6 border-t border-border pt-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {socials.map((item) => {
            const Icon = item.icon
            const sharedClasses =
              'group relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-sm transition-all hover:border-primary hover:text-primary hover:bg-surface-elevated'

            const icon = <Icon className="h-5 w-5" aria-hidden />

            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className={sharedClasses}
                >
                  {icon}
                </a>
              )
            }

            return (
              <span key={item.label} className={sharedClasses} aria-label={item.label}>
                {icon}
                {item.qrImage ? (
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 hidden -translate-x-1/2 flex-col items-center gap-1 rounded-lg border border-border bg-surface-elevated p-2 text-[10px] text-text-muted shadow-lg group-hover:flex">
                    <img
                      src={item.qrImage}
                      alt={item.qrAlt ?? item.label}
                      width={112}
                      height={112}
                      className="h-28 w-28 rounded"
                      loading="lazy"
                      decoding="async"
                    />
                    {item.qrHint ? <span>{item.qrHint}</span> : null}
                  </span>
                ) : null}
              </span>
            )
          })}
        </div>
        <div className="flex flex-col gap-2 text-center text-sm text-text-muted">
          <p>{copy.footer.tagline}</p>
          {copy.footer.description ? <p>{copy.footer.description}</p> : null}
        </div>
      </div>
    </footer>
  )
}
