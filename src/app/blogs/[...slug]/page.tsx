/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import BlogBackLink from "@/components/onwalk/BlogBackLink";
import BlogHeader from "@/components/onwalk/BlogHeader";
import {
  getContentBySlug,
  getBlogCategories,
  getPostsByCategory,
  type BlogCategory,
} from "@/lib/content";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { renderMarkdownContent } from "@/server/render-markdown";

type PageProps = {
  params: Promise<{ slug: string | string[] }>;
};

const DESCRIPTION_MIN = 120;
const DESCRIPTION_MAX = 160;

// Get category information dynamically
async function getCategoryInfo(slugPath: string): Promise<BlogCategory | null> {
  const categories = await getBlogCategories();
  return categories.find((cat) => cat.key === slugPath) || null;
}

function normalizeSlug(slugParam: string | string[]) {
  return Array.isArray(slugParam) ? slugParam.join("/") : slugParam;
}

function markdownToPlainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[(.*?)\]\([^)]+\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getDescriptionText(post: { content?: string; summary?: string }) {
  const summary = typeof post.summary === "string" ? post.summary.trim() : "";
  const rawText = summary || markdownToPlainText(post.content ?? "");

  if (rawText.length <= DESCRIPTION_MAX) {
    return rawText;
  }

  const sentenceEndings = /[.!?。！？]/g;
  const candidates = Array.from(rawText.matchAll(sentenceEndings))
    .map((match) => match.index ?? 0)
    .filter((index) => index >= DESCRIPTION_MIN - 1 && index < DESCRIPTION_MAX);

  if (candidates.length > 0) {
    return rawText.slice(0, candidates[candidates.length - 1] + 1).trim();
  }

  const sentences = rawText
    .split(/(?<=[.!?。！？])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  let assembled = "";
  for (const sentence of sentences) {
    const next = assembled ? `${assembled} ${sentence}` : sentence;
    if (next.length > DESCRIPTION_MAX) {
      break;
    }
    assembled = next;
    if (assembled.length >= DESCRIPTION_MIN) {
      break;
    }
  }
  if (assembled.length >= DESCRIPTION_MIN) {
    return assembled.trim();
  }

  const cutoff = rawText.lastIndexOf(" ", DESCRIPTION_MAX);
  if (cutoff > DESCRIPTION_MIN) {
    return rawText.slice(0, cutoff).trim();
  }

  return rawText.slice(0, DESCRIPTION_MAX).trim();
}

function isLocalImage(src: string) {
  return src.startsWith("/") && !src.startsWith("//");
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slugPath = normalizeSlug((await params).slug);

  // Check if this is a category page
  const categoryInfo = await getCategoryInfo(slugPath);

  if (categoryInfo) {
    // This is a category page
    return {
      title: `${categoryInfo.title} | Onwalk`,
      description: categoryInfo.description,
      alternates: {
        canonical: `/blogs/${slugPath}`,
      },
      openGraph: {
        title: `${categoryInfo.title} | Onwalk`,
        description: categoryInfo.description,
        url: `https://www.onwalk.net/blogs/${slugPath}`,
        siteName: "Onwalk",
        locale: "zh_CN",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${categoryInfo.title} | Onwalk`,
        description: categoryInfo.description,
      },
    };
  }

  // This is an individual blog post
  const post = await getContentBySlug("blog", slugPath);

  if (!post) {
    return {
      title: "笔记",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl = "https://www.onwalk.net";
  const canonicalUrl = `${baseUrl}/blogs/${slugPath}`;

  return {
    title: post.title ?? "笔记",
    description: getDescriptionText(post),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title ?? "笔记",
      description: getDescriptionText(post),
      url: canonicalUrl,
      siteName: "Onwalk",
      locale: "zh_CN",
      type: "article",
      ...(post.cover
        ? {
            images: [
              {
                url: `${baseUrl}${post.cover}`,
                width: 1200,
                height: 800,
                alt: post.title ?? post.slug,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title ?? "笔记",
      description: getDescriptionText(post),
      ...(post.cover
        ? {
            images: [`${baseUrl}${post.cover}`],
          }
        : {}),
    },
    other: {
      "article:published_time": post.date || "",
      "article:modified_time": post.date || "",
    },
  };
}

export default async function BlogSlugPage({ params }: PageProps) {
  const slugPath = normalizeSlug((await params).slug);
  const cookieStore = await cookies();
  const language = cookieStore.get("onwalk.language")?.value || "zh";

  // Check if this is a category page
  const categoryInfo = await getCategoryInfo(slugPath);

  if (categoryInfo) {
    // This is a category page - render posts in this category
    const categoryPosts = await getPostsByCategory(slugPath);
    const allCategories = await getBlogCategories();

    // Update category count from actual posts
    const updatedCategoryInfo = {
      ...categoryInfo,
      count: categoryPosts.length,
    };

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-6 pb-20">
          <BreadcrumbJsonLd
            items={[
              { name: "Home", path: "/" },
              { name: "Blogs", path: "/blogs" },
              { name: updatedCategoryInfo.title, path: `/blogs/${slugPath}` },
            ]}
          />
          <BlogHeader
            variant={updatedCategoryInfo.variant}
            activeHref={`/blogs/${slugPath}`}
            categories={allCategories}
          />

          <div className="space-y-12">
            <section>
              {categoryPosts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {categoryPosts.map((post) => (
                    <article
                      key={post.slug}
                      className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="relative group">
                          {post.cover && (
                            <img
                              src={post.cover}
                              alt={post.title || post.slug}
                              width={1200}
                              height={800}
                              className="h-48 w-full rounded-xl object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                          <button
                            className="absolute bottom-2 right-2 rounded-full bg-white/90 p-2 text-slate-700 opacity-0 shadow-sm transition group-hover:opacity-100 hover:text-brand"
                            title="Quick View"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-eye"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold">
                            <a
                              className="hover:underline"
                              href={`/blogs/${post.slug}`}
                            >
                              {post.title}
                            </a>
                          </h2>
                          <p className="mt-1 text-xs text-slate-500">
                            {post.date}
                          </p>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-3">
                          {markdownToPlainText(post.content).slice(0, 120)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <a
                            className="text-sm font-semibold text-brand hover:text-brand-dark"
                            href={`/blogs/${post.slug}`}
                          >
                            阅读 →
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">暂无相关文章。</p>
                </div>
              )}
            </section>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // This is an individual blog post
  const post = await getContentBySlug("blog", slugPath);

  if (!post) {
    notFound();
  }

  const baseUrl = "https://www.onwalk.net";
  const canonicalUrl = `${baseUrl}/blogs/${slugPath}`;
  const imageUrl = post.cover ? `${baseUrl}${post.cover}` : undefined;
  const description = post.content?.slice(0, 160);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title ?? "笔记",
    datePublished: post.date,
    dateModified: post.date,
    description,
    image: imageUrl ? [imageUrl] : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    url: canonicalUrl,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BlogBackLink />
        <header className="mt-6 space-y-3">
          <h1 className="text-3xl font-semibold">{post.title}</h1>
          {post.date && <p className="text-xs text-slate-500">{post.date}</p>}
          {post.cover &&
            (isLocalImage(post.cover) ? (
              <Image
                src={post.cover}
                alt={post.title ?? post.slug}
                width={1200}
                height={800}
                sizes="100vw"
                className="mt-6 h-auto w-full rounded-2xl"
              />
            ) : (
              <img
                src={post.cover}
                alt={post.title ?? post.slug}
                width={1200}
                height={800}
                className="mt-6 h-auto w-full rounded-2xl"
                loading="lazy"
                decoding="async"
              />
            ))}
        </header>
        <article
          className="prose mt-8 max-w-none text-sm leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: renderMarkdownContent(post.content),
          }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
