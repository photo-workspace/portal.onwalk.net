export const dynamic = 'force-dynamic'

import Link from 'next/link'

import PostCard from '@/components/PostCard'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import BlogHeader from '@/components/onwalk/BlogHeader'
import { getContent } from '@/lib/content'

const PAGE_SIZE = 6

type PageProps = {
  searchParams?: Promise<{ page?: string }> | { page?: string }
}

export default async function BlogPage({ searchParams }: PageProps) {
  const posts = await getContent('blog')
  const resolvedSearchParams = (await Promise.resolve(searchParams)) ?? {}
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  const currentPage = Math.min(
    Math.max(Number(resolvedSearchParams.page ?? 1) || 1, 1),
    totalPages,
  )
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const pagedPosts = posts.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <BlogHeader variant="overview" activeHref="/blog" />
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
                  href={`/blog?page=${currentPage - 1}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50"
                >
                  Previous
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
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
