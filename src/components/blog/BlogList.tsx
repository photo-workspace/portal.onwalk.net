'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import BrandCTA from '@components/BrandCTA'
import SearchComponent from '@components/search'
import type { BlogCategory, BlogPostSummary } from '@lib/blogContent'

function formatDate(dateStr: string | undefined, language: 'zh' | 'en'): string {
  if (!dateStr) return ''

  const date = new Date(dateStr)

  if (language === 'zh') {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface BlogListProps {
  posts: BlogPostSummary[]
  categories: BlogCategory[]
}

function buildCategoryCounts(posts: BlogPostSummary[]) {
  return posts.reduce<Record<string, number>>((acc, post) => {
    const categoryKey = post.category?.key
    if (!categoryKey) return acc
    acc[categoryKey] = (acc[categoryKey] || 0) + 1
    return acc
  }, {})
}

function detectLanguage(posts: BlogPostSummary[]): 'zh' | 'en' {
  for (const post of posts) {
    if (/[\u4e00-\u9fff]/.test(`${post.title} ${post.excerpt}`)) {
      return 'zh'
    }
  }
  return 'en'
}

export default function BlogList({ posts, categories }: BlogListProps) {
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category')
  const page = searchParams.get('page')

  const categoryTabs = useMemo(() => {
    const categoriesFromPosts = posts
      .map((post) => post.category)
      .filter((category): category is NonNullable<BlogPostSummary['category']> => Boolean(category))
      .map((category) => ({ key: category.key, label: category.label ?? category.key }))

    return [...categories, ...categoriesFromPosts].filter(
      (category, index, self) => self.findIndex((item) => item.key === category.key) === index,
    )
  }, [categories, posts])

  const categoryCounts = useMemo(() => buildCategoryCounts(posts), [posts])
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts
    return posts.filter((post) => post.category?.key === selectedCategory)
  }, [posts, selectedCategory])

  const postsPerPage = 10
  const currentPage = useMemo(() => {
    const parsed = Number(page || '1')
    if (!Number.isFinite(parsed) || parsed < 1) return 1
    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage))
    return Math.min(parsed, totalPages)
  }, [page, filteredPosts.length])
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage))
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex)
  const language = useMemo(() => detectLanguage(filteredPosts), [filteredPosts])

  return (
    <div className="bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-slate-500">SVC.plus</span>
            <span className="text-slate-400">/</span>
            <span className="text-brand-dark">blog</span>
          </Link>
          <div className="flex items-center gap-3">
            <SearchComponent className="relative w-full max-w-xs" />
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Blog</h1>
            <p className="text-lg text-slate-600">
              Latest updates, releases, and insights from the Cloud-Neutral community.
            </p>
          </div>

          <div className="mb-10 flex flex-wrap items-center gap-3">
            {categoryTabs.map((tab) => {
              const isActive = tab.key === selectedCategory
              const labelWithCount = categoryCounts[tab.key]

              return (
                <Link
                  key={tab.key}
                  href={`/blog${isActive ? '' : `?category=${tab.key}`}`}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'border-brand bg-brand text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand/60 hover:text-brand'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{tab.label}</span>
                  {labelWithCount ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {labelWithCount}
                    </span>
                  ) : null}
                </Link>
              )
            })}
            <Link
              href="/blog"
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                !selectedCategory
                  ? 'border-brand bg-brand text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand/60 hover:text-brand'
              }`}
            >
              全部
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  !selectedCategory ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {posts.length}
              </span>
            </Link>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500">暂无博客文章</p>
            </div>
          ) : (
            <>
              <div className="grid gap-8">
                {paginatedPosts.map((post) => (
                  <article
                    key={post.slug}
                    className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-brand">Blog</span>
                      {post.date && <time className="text-sm text-slate-500">{formatDate(post.date, 'en')}</time>}
                    </div>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">{post.title}</h2>
                    {post.author && <p className="mb-4 text-sm text-slate-500">By {post.author}</p>}
                    <p className="mb-6 text-slate-600">{post.excerpt}</p>
                    <div className="flex items-center gap-4">
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="ml-auto text-sm font-semibold text-brand transition hover:text-brand-dark"
                      >
                        Read more →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-2">
                  <Link
                    href={`/blog?page=${Math.max(1, currentPage - 1)}${selectedCategory ? `&category=${selectedCategory}` : ''}`}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                      currentPage === 1
                        ? 'cursor-not-allowed text-slate-400'
                        : 'text-brand hover:bg-slate-100'
                    }`}
                    aria-disabled={currentPage === 1}
                  >
                    Previous
                  </Link>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <Link
                      key={pageNumber}
                      href={`/blog?page=${pageNumber}${selectedCategory ? `&category=${selectedCategory}` : ''}`}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                        pageNumber === currentPage
                          ? 'bg-brand text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  ))}

                  <Link
                    href={`/blog?page=${Math.min(totalPages, currentPage + 1)}${
                      selectedCategory ? `&category=${selectedCategory}` : ''
                    }`}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                      currentPage === totalPages
                        ? 'cursor-not-allowed text-slate-400'
                        : 'text-brand hover:bg-slate-100'
                    }`}
                    aria-disabled={currentPage === totalPages}
                  >
                    Next
                  </Link>
                </nav>
              )}

            </>
          )}

          <div className="mt-12">
            <BrandCTA lang={language} variant="compact" />
          </div>
        </div>
      </main>
    </div>
  )
}
