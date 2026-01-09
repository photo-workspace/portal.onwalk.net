'use client'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'

export default function HomeHero() {
  const copy = useOnwalkCopy()

  return (
    <section className="grid gap-8 rounded-[32px] border border-slate-200 bg-white/80 p-10 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
        <span className="rounded-full border border-slate-300 px-3 py-1">{copy.home.hero.badge}</span>
        <span>{copy.home.hero.tagline}</span>
      </div>
      <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{copy.home.hero.title}</h1>
      <p className="max-w-2xl text-sm text-slate-600">{copy.home.hero.description}</p>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="rounded-full bg-slate-900 px-3 py-1 font-medium text-white">{copy.home.hero.chips.featured}</span>
        <span className="rounded-full border border-slate-200 px-3 py-1">{copy.home.hero.chips.moments}</span>
        <span className="rounded-full border border-slate-200 px-3 py-1">{copy.home.hero.chips.theater}</span>
        <span className="rounded-full border border-slate-200 px-3 py-1">{copy.home.hero.chips.journal}</span>
      </div>
    </section>
  )
}
