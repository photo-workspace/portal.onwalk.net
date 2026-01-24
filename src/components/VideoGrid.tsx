"use client";
/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useOnwalkCopy } from "@/i18n/useOnwalkCopy";
import type { ContentItem } from "@/lib/content";
import { copyToClipboard } from "@/lib/clipboard";
import MediaDetailModal from "./MediaDetailModal";

const PAGE_SIZE = 12;

type VideoGridVariant = "overview" | "full";
type VideoGridColumns = 2 | 3;

function isLocalImage(src: string) {
  return src.startsWith("/") && !src.startsWith("//");
}

export default function VideoGrid({
  items,
  variant = "full",
  columns = 2,
}: {
  items: ContentItem[];
  variant?: VideoGridVariant;
  columns?: VideoGridColumns;
}) {
  const copy = useOnwalkCopy();
  const videoItems = items;
  const [sort, setSort] = useState<"latest" | "location" | "views">("latest");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pageIndex, setPageIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const handleSort = (newSort: "latest" | "location" | "views") => {
    if (sort === newSort) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSort(newSort);
      setSortDirection("desc");
    }
  };

  const handleCopyMarkdown = async (e: React.MouseEvent, item: ContentItem) => {
    e.preventDefault();
    e.stopPropagation();
    const baseUrl =
      process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "") || "";
    const markdown = `[${item.title ?? item.slug}](${baseUrl}/${item.slug})`;
    console.log(
      "[Debug] Generated Markdown:",
      markdown,
      "BaseURL:",
      baseUrl,
      "Slug:",
      item.slug,
    );

    const success = await copyToClipboard(markdown);
    if (success) {
      console.log("Markdown copied successfully");
      setCopiedKey(item.slug);
      setTimeout(() => setCopiedKey(null), 2000);
    } else {
      console.error("Failed to copy markdown");
    }
  };

  // Reset page when order changes
  useMemo(() => {
    setPageIndex(0);
  }, [sort, sortDirection]);

  const sortedItems = useMemo(() => {
    const list = [...items];
    let comparison = 0;
    list.sort((a, b) => {
      if (sort === "location") {
        const locA = Array.isArray(a.location)
          ? a.location.join(", ")
          : a.location || "";
        const locB = Array.isArray(b.location)
          ? b.location.join(", ")
          : b.location || "";
        comparison = locA.localeCompare(locB);
      } else if (sort === "views") {
        comparison = (a.views || 0) - (b.views || 0);
      } else {
        // latest/date
        const tA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const tB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        comparison = tA - tB;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return list;
  }, [items, sort, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const clampedPageIndex = Math.min(pageIndex, totalPages - 1);
  const pagedItems = useMemo(() => {
    const start = clampedPageIndex * PAGE_SIZE;
    return sortedItems.slice(start, start + PAGE_SIZE);
  }, [sortedItems, clampedPageIndex]);

  const currentItems =
    variant === "overview" ? sortedItems.slice(0, 4) : pagedItems;
  const canGoBack = clampedPageIndex > 0;
  const canGoForward = clampedPageIndex < totalPages - 1;

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    // Use a consistent date format to avoid hydration mismatch
    const date = new Date(isoString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  return (
    <div className="space-y-8">
      {variant === "full" && (
        <div className="mb-6 flex flex-wrap items-center justify-end gap-3 text-sm">
          <span className="text-slate-500 mr-2">排序:</span>
          <button
            onClick={() => handleSort("latest")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${sort === "latest" ? "bg-primary text-primary-foreground" : "bg-surface text-text-muted hover:bg-surface-hover"}`}
          >
            更新时间{" "}
            {sort === "latest" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("location")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${sort === "location" ? "bg-primary text-primary-foreground" : "bg-surface text-text-muted hover:bg-surface-hover"}`}
          >
            位置 {sort === "location" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("views")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${sort === "views" ? "bg-primary text-primary-foreground" : "bg-surface text-text-muted hover:bg-surface-hover"}`}
          >
            访问量 {sort === "views" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
        </div>
      )}

      <div
        className={`grid gap-6 ${columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}
      >
        {currentItems.map((item) => (
          <div
            key={item.slug}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:bg-surface-elevated"
          >
            <button
              onClick={(e) => handleCopyMarkdown(e, item)}
              title={
                copiedKey === item.slug
                  ? copy.video.markdownCopied
                  : copy.video.copyMarkdown
              }
              className={`absolute right-3 top-3 z-10 hidden items-center justify-center rounded-full p-2 text-white backdrop-blur-md transition group-hover:flex ${copiedKey === item.slug
                  ? "bg-green-500/80 hover:bg-green-600/90"
                  : "bg-black/50 hover:bg-black/70"
                }`}
            >
              {copiedKey === item.slug ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </button>
            <div className="relative">
              {item.src ? (
                <video
                  src={item.src}
                  poster={item.poster}
                  loop
                  playsInline
                  className="h-48 w-full object-cover sm:h-56 cursor-pointer"
                  onMouseEnter={(event) => event.currentTarget.play()}
                  onMouseLeave={(event) => event.currentTarget.pause()}
                  onClick={() => setSelectedItem(item)}
                />
              ) : item.poster ? (
                isLocalImage(item.poster) ? (
                  <Image
                    src={item.poster}
                    alt={item.title ?? item.slug}
                    width={1280}
                    height={720}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="h-48 w-full object-cover sm:h-56 cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  />
                ) : (
                  <img
                    src={item.poster}
                    alt={item.title ?? item.slug}
                    width={1280}
                    height={720}
                    className="h-48 w-full object-cover sm:h-56 cursor-pointer"
                    loading="lazy"
                    decoding="async"
                    onClick={() => setSelectedItem(item)}
                  />
                )
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-text-muted">
                  {copy.video.empty}
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/30 text-white shadow-sm backdrop-blur-md">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white">
                {item.duration ?? "04:20"}
              </span>
            </div>
            <div className="space-y-1 p-4">
              <Link
                href={`/videos/${item.slug}`}
                className="text-lg font-bold text-heading hover:text-primary transition-colors"
                title={item.title ?? item.slug}
              >
                {item.title ?? item.slug}
              </Link>
              <div className="flex flex-wrap items-center justify-between text-sm text-text-secondary w-full">
                {item.updatedAt && (
                  <span title="Update time">{formatTime(item.updatedAt)}</span>
                )}
                {item.location && <span title="Location">{item.location}</span>}
                {item.views && <span title="Views">👁️ {item.views}</span>}
              </div>
              {item.src &&
                item.src.startsWith("/") &&
                !item.src.startsWith("//") && (
                  <p className="mt-2 rounded bg-red-100 p-2 text-xs text-red-600">
                    ⚠️ Relative URL detected: {item.src}. <br />
                    Check NEXT_PUBLIC_MEDIA_BASE_URL config.
                  </p>
                )}
            </div>
          </div>
        ))}
      </div>
      {variant === "full" && (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[#747775]">
          <span>
            {copy.video.pageLabel ?? "Page"} {clampedPageIndex + 1} /{" "}
            {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-border px-4 py-2 text-text transition hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPageIndex(Math.max(0, clampedPageIndex - 1))}
              disabled={!canGoBack}
            >
              {copy.video.prev ?? "上一页"}
            </button>
            <button
              type="button"
              className="rounded-full border border-border px-4 py-2 text-text transition hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                setPageIndex(Math.min(totalPages - 1, clampedPageIndex + 1))
              }
              disabled={!canGoForward}
            >
              {copy.video.next ?? "下一页"}
            </button>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      <div
        className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-900 shadow-lg backdrop-blur transition-all duration-300 ${copiedKey
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
          }`}
      >
        {copy.video.markdownCopied}
      </div>

      {selectedItem && (
        <MediaDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          type="video"
          onNext={() => {
            const currentIndex = sortedItems.findIndex(
              (i) => i.slug === selectedItem.slug,
            );
            if (currentIndex < sortedItems.length - 1) {
              setSelectedItem(sortedItems[currentIndex + 1]);
            }
          }}
          onPrev={() => {
            const currentIndex = sortedItems.findIndex(
              (i) => i.slug === selectedItem.slug,
            );
            if (currentIndex > 0) {
              setSelectedItem(sortedItems[currentIndex - 1]);
            }
          }}
          hasNext={
            sortedItems.findIndex((i) => i.slug === selectedItem.slug) <
            sortedItems.length - 1
          }
          hasPrev={
            sortedItems.findIndex((i) => i.slug === selectedItem.slug) > 0
          }
        />
      )}
    </div>
  );
}
