
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'

import PostCard from '@/components/PostCard'
import HeroPostCard from '@/components/HeroPostCard'
import BlogInfiniteList from '@/components/BlogInfiniteList'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import BlogHeader from '@/components/onwalk/BlogHeader'
import { getContent, sortContentByDate, filterPostsByLanguage, type ContentItem } from '@/lib/content'
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd'


export const dynamic = 'force-dynamic'

const HERO_PAGE_SIZE = 7 // 1 Hero + 6 Grid items (2 cols * 3 rows)
const STD_PAGE_SIZE = 6  // 6 Grid items (2 cols * 3 rows)

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

  // Calculate total pages logic with variable first page
  const remainingAfterFirst = Math.max(0, totalPosts - HERO_PAGE_SIZE)
  const additionalPages = Math.ceil(remainingAfterFirst / STD_PAGE_SIZE)
  const totalPages = 1 + additionalPages

  const currentPage = Math.min(safePage, totalPages)

  return { currentPage, totalPages }
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const posts = sortContentByDate(await getContent('blog'))
  // Note: we can't easily filter by language in metadata generation without duplicating logic
  // keeping it simple for now as metadata doesn't strictly depend on language filtering for counts
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
  const cookieStore = await cookies()
  const language = cookieStore.get('onwalk.language')?.value || 'zh'

  const allPosts = await getContent('blog')
  const posts = filterPostsByLanguage(allPosts, language)

  const { currentPage } = await resolvePagination(searchParams, posts.length)

  // Calculate start index based on variable page size
  let startIndex = 0
  let pageSize = HERO_PAGE_SIZE

  if (currentPage > 1) {
    startIndex = HERO_PAGE_SIZE + (currentPage - 2) * STD_PAGE_SIZE
    pageSize = STD_PAGE_SIZE
  }

  const pagedPosts = posts.slice(startIndex, startIndex + pageSize)

  // Determine Hero post logic
  const showHero = currentPage === 1 && pagedPosts.length > 0
  const heroPost = showHero ? pagedPosts[0] : null
  const gridPosts = showHero ? pagedPosts.slice(1) : pagedPosts

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <BreadcrumbJsonLd items={[
          { name: 'Home', path: '/' },
          { name: 'Blogs', path: '/blogs' }
        ]} />
        <BlogHeader variant="overview" activeHref="/blogs" />

        <div className="space-y-12">
          {/* Unified List with Client Interactivity */}
          <section>
            <BlogInfiniteList
              initialPosts={gridPosts}
              heroPost={heroPost || undefined}
              language={language}
            />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
