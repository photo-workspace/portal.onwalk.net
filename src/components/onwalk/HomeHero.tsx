'use client'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'

export default function HomeHero() {
  const copy = useOnwalkCopy()

  return (
    <section className="grid gap-8 rounded-3xl bg-[var(--color-surface)] p-10 shadow-sm border border-[var(--color-surface-border)]">
      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
        <span className="rounded-full border border-[var(--color-surface-border-strong)] px-3 py-1">{copy.home.hero.badge}</span>
        <span>{copy.home.hero.tagline}</span>
      </div>
      <h1 className="text-3xl font-medium text-[var(--color-heading)] md:text-4xl">{copy.home.hero.title}</h1>
      <p className="max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">{copy.home.hero.description}</p>
      <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
        <span className="rounded-full bg-[var(--color-text)] px-3 py-1 font-medium text-[var(--color-text-inverse)]">{copy.home.hero.chips.featured}</span>
        <span className="rounded-full border border-[var(--color-surface-border)] px-3 py-1 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors">{copy.home.hero.chips.moments}</span>
        <span className="rounded-full border border-[var(--color-surface-border)] px-3 py-1 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors">{copy.home.hero.chips.theater}</span>
        <span className="rounded-full border border-[var(--color-surface-border)] px-3 py-1 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors">{copy.home.hero.chips.journal}</span>
      </div>
    </section>
  )
}
