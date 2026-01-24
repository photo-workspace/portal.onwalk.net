"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  Minimize2,
  Maximize2,
  AlignLeft,
  AlignVerticalJustifyCenter,
} from "lucide-react";
import { marked } from "marked";
import type { ContentItem } from "@/lib/types";

type LayoutMode = "side" | "stacked";

type MediaDetailModalProps = {
  item: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video";
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
};

export default function MediaDetailModal({
  item,
  isOpen,
  onClose,
  type,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: MediaDetailModalProps) {
  const [layout, setLayout] = useState<LayoutMode>("side");
  const [isTextCollapsed, setIsTextCollapsed] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  // Markdown parsing
  useEffect(() => {
    if (item.content) {
      const parsed = marked.parse(item.content);
      if (typeof parsed === "string") {
        setHtmlContent(parsed);
      } else {
        Promise.resolve(parsed).then((res) => setHtmlContent(res));
      }
    } else {
      setHtmlContent("");
    }
  }, [item.content]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && onNext && hasNext) onNext();
      if (e.key === "ArrowLeft" && onPrev && hasPrev) onPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onNext, onPrev, hasNext, hasPrev, onClose]);

  if (!isOpen) return null;

  const mediaSrc = type === "video" ? item.src : item.cover;
  const posterSrc = item.poster;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300">
      <style jsx global>{`
        @keyframes magazine-turn {
          0% {
            opacity: 0;
            transform: translateX(20px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-magazine {
          animation: magazine-turn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-[110] rounded-full bg-black/50 p-3 text-white backdrop-blur-md hover:bg-white/20 hover:text-white transition"
      >
        <X size={24} />
      </button>

      {/* Navigation - PREV */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev?.();
          }}
          className="absolute left-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20 hidden md:flex transition hover:scale-110"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Navigation - NEXT */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          className="absolute right-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20 hidden md:flex transition hover:scale-110"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Main Container - Key changes trigger animation */}
      <div
        key={item.slug}
        className={`relative flex animate-magazine max-h-[95vh] max-w-[95vw] shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl bg-white
          ${layout === "side"
            ? "h-[90vh] w-[95vw] flex-row"
            : "h-[95vh] w-[80vw] flex-col"
          }`}
      >
        {/* Media Section */}
        <div
          className={`relative flex items-center justify-center bg-black transition-all duration-500
          ${layout === "side"
              ? isTextCollapsed
                ? "w-full"
                : "w-2/3"
              : isTextCollapsed
                ? "h-full"
                : "h-2/3"
            }`}
        >
          {type === "video" ? (
            <video
              src={mediaSrc}
              poster={posterSrc}
              controls
              autoPlay
              className="h-full w-full object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaSrc}
              alt={item.title || ""}
              className="h-full w-full object-contain"
            />
          )}

          {/* View Controls Overlay (Bottom Left of Media) */}
          <div className="absolute bottom-6 left-6 flex gap-3 z-10">
            <button
              onClick={() =>
                setLayout((prev) => (prev === "side" ? "stacked" : "side"))
              }
              className="rounded-full bg-black/50 p-2.5 text-white backdrop-blur-md hover:bg-white/20 transition hover:scale-105"
              title={
                layout === "side"
                  ? "Switch to Stacked View"
                  : "Switch to Free View"
              }
            >
              {layout === "side" ? (
                <AlignVerticalJustifyCenter size={20} />
              ) : (
                <AlignLeft size={20} />
              )}
            </button>
            <button
              onClick={() => setIsTextCollapsed((prev) => !prev)}
              className="rounded-full bg-black/50 p-2.5 text-white backdrop-blur-md hover:bg-white/20 transition hover:scale-105"
              title={isTextCollapsed ? "Show Text" : "Hide Text"}
            >
              {isTextCollapsed ? (
                <Maximize2 size={20} />
              ) : (
                <Minimize2 size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div
          className={`relative flex flex-col bg-white overflow-hidden transition-all duration-500
          ${layout === "side"
              ? isTextCollapsed
                ? "w-0 opacity-0"
                : "w-1/3 opacity-100 border-l border-slate-100"
              : isTextCollapsed
                ? "h-0 opacity-0"
                : "h-1/3 opacity-100 border-t border-slate-100"
            }`}
        >
          <div className="h-full overflow-y-auto px-8 py-10">
            <div className="mb-8 border-b border-slate-100 pb-6">
              <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                {item.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                {item.location && (
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>
                      {Array.isArray(item.location)
                        ? item.location.join(", ")
                        : item.location}
                    </span>
                  </div>
                )}
                {item.date && (
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>
                      {new Date(item.date).toISOString().split("T")[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div
              className="prose prose-slate prose-lg max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
