export const dynamic = 'error'
export const revalidate = false

import type { Metadata } from 'next'
import { Suspense } from 'react'

import BlogList from '@components/blog/BlogList'
import type { BlogCategory, BlogPostSummary } from '@lib/blogContent'
import { getBlogCategories, getBlogPosts } from '@lib/blogContent'

export const metadata: Metadata = {
  title: 'Blog | Cloud-Neutral',
  description: 'Latest updates, releases, and insights from the Cloud-Neutral community.',
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const categories: BlogCategory[] = await getBlogCategories()
  const postsWithoutContent: BlogPostSummary[] = posts.map(({ content: _content, ...post }) => post)
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading blog content...</div>}>
      <BlogList posts={postsWithoutContent} categories={categories} />
    </Suspense>
  )
}
