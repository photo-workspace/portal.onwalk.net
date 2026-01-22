"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useOnwalkCopy } from "@/i18n/useOnwalkCopy";
import { type BlogCategory } from "@/lib/content";

type BlogHeaderVariant = "overview" | "tracks" | "city" | "scenery";

interface BlogHeaderProps {
  variant: BlogHeaderVariant;
  activeHref: string;
  categories?: BlogCategory[]; // Make categories optional to maintain backward compatibility
}

export default function BlogHeader({
  variant,
  activeHref,
  categories,
}: BlogHeaderProps) {
  const copy = useOnwalkCopy();
  const [dynamicCategories, setDynamicCategories] = useState<BlogCategory[]>(
    [],
  );

  const headerMap = {
    overview: copy.blog.overview,
    tracks: copy.blog.sections.tracks,
    city: copy.blog.sections.city,
    scenery: copy.blog.sections.scenery,
  };

  const header = headerMap[variant];

  // Use dynamic categories if provided, otherwise fall back to static mapping
  const navItems =
    categories && categories.length > 0
      ? categories.map((cat) => ({
          label: cat.title,
          href: `/blogs/${cat.key}`,
          count: cat.count,
        }))
      : [
          {
            label: copy.blog.categories.tracks,
            href: "/blogs/Tracks",
            count: 0,
          },
          { label: copy.blog.categories.city, href: "/blogs/City", count: 0 },
          {
            label: copy.blog.categories.scenery,
            href: "/blogs/Scenery",
            count: 0,
          },
        ];

  return (
    <header className="space-y-4 pb-10">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {header.eyebrow}
      </p>
      <h1 className="text-3xl font-semibold">{header.title}</h1>
      <p className="text-sm text-slate-600">{header.subtitle}</p>
      <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        {navItems.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              {item.label}
              {item.count > 0 && (
                <span className="ml-2 text-xs opacity-75">({item.count})</span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
