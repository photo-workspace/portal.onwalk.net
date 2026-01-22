import { onwalkCopy } from "@/i18n/onwalk";
import type { Language } from "@/i18n/language";

export default function HomeHero({ language }: { language: string }) {
  const copy = onwalkCopy[language as Language] || onwalkCopy.zh;

  return (
    <section className="grid gap-8 rounded-large border border-border bg-surface p-10 shadow-sm transition-colors duration-300">
      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-text-secondary">
        <span className="rounded-full border border-border px-3 py-1">
          {copy.home.hero.badge}
        </span>
        <span>{copy.home.hero.tagline}</span>
      </div>
      <h1 className="font-display text-4xl font-bold tracking-tight text-heading md:text-5xl">
        {copy.home.hero.title}
      </h1>
      <p className="max-w-2xl text-lg leading-relaxed text-text-secondary">
        {copy.home.hero.description}
      </p>
      <div className="flex flex-wrap gap-3 text-xs font-medium">
        <span className="rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-md transition hover:brightness-110">
          {copy.home.hero.chips.featured}
        </span>
        <span className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-text transition hover:bg-border cursor-pointer">
          {copy.home.hero.chips.moments}
        </span>
        <span className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-text transition hover:bg-border cursor-pointer">
          {copy.home.hero.chips.theater}
        </span>
        <span className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-text transition hover:bg-border cursor-pointer">
          {copy.home.hero.chips.journal}
        </span>
      </div>
    </section>
  );
}
