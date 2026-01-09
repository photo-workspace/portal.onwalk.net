'use client'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'

export default function AboutContent() {
  const copy = useOnwalkCopy()

  return (
    <>
      <header className="space-y-3 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{copy.about.eyebrow}</p>
        <h1 className="text-3xl font-semibold">{copy.about.title}</h1>
        <p className="text-sm text-slate-600">{copy.about.subtitle}</p>
      </header>
      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        {copy.about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </>
  )
}
