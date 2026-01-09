export const dynamic = 'error'
export const revalidate = false

import PostCard from '@/components/PostCard'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import BlogHeader from '@/components/onwalk/BlogHeader'
import { getContent } from '@/lib/content'

export default async function BlogPage() {
  const posts = await getContent('blog')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <BlogHeader variant="overview" activeHref="/blog" />
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
