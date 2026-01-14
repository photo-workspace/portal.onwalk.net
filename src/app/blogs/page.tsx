
import type { Metadata } from 'next'

import Link from 'next/link'

import PostCard from '@/components/PostCard'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import BlogHeader from '@/components/onwalk/BlogHeader'
import { getContent, sortContentByDate } from '@/lib/content'

const PAGE_SIZE = 6

const baseMetadata: Metadata = {
  title: '博客 | Onwalk',
  description: 'Onwalk 博客，记录行走、摄影与城市观察的故事与更新。',
  alternates: {
    canonical: '/blogs',
  },
}

type PageProps = {
  searchParams?: Promise<{ page?: string }> | { page?: string }
}

async function resolvePagination(
  searchParams: PageProps['searchParams'],
  totalPosts: number,
) {
  const resolvedSearchParams = (await Promise.resolve(searchParams)) ?? {}
  const page = Number(resolvedSearchParams.page ?? 1)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE))
  const currentPage = Math.min(safePage, totalPages)

  return { currentPage, totalPages }
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const posts = sortContentByDate(await getContent('blog'))
  const { currentPage, totalPages } = await resolvePagination(
    searchParams,
    posts.length,
  )
  const basePath = '/blogs'
  const previous =
    currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : undefined
  const next =
    currentPage < totalPages
      ? `${basePath}?page=${currentPage + 1}`
      : undefined
  const pagination: Metadata['pagination'] = {}

  if (previous) {
    pagination.previous = previous
  }
  if (next) {
    pagination.next = next
  }

  return {
    ...baseMetadata,
    alternates: {
      canonical:
        currentPage === 1 ? basePath : `${basePath}?page=${currentPage}`,
    },
    ...(Object.keys(pagination).length > 0 ? { pagination } : {}),
  }
}

export default async function BlogPage({ searchParams }: PageProps) {
  const posts = sortContentByDate(await getContent('blog'))
  const { currentPage, totalPages } = await resolvePagination(searchParams, posts.length)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const pagedPosts = posts.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <BlogHeader variant="overview" activeHref="/blogs" />
        <div className="grid gap-6 md:grid-cols-2">
          {pagedPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        {totalPages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-3">
              {currentPage > 1 && (
                <Link
                  href={`/blogs?page=${currentPage - 1}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50"
                >
                  Previous
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/blogs?page=${currentPage + 1}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50"
                >
                  Next
                </Link>
              )}
            </div>
          </nav>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
