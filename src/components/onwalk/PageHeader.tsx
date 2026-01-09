'use client'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'

type PageVariant = 'image' | 'video'

export default function PageHeader({ variant }: { variant: PageVariant }) {
  const copy = useOnwalkCopy()
  const header = copy[variant]

  return (
    <header className="space-y-3 pb-10">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{header.eyebrow}</p>
      <h1 className="text-3xl font-semibold">{header.title}</h1>
      <p className="text-sm text-slate-600">{header.subtitle}</p>
    </header>
  )
}
