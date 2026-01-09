export const dynamic = 'error'
export const revalidate = false

import PostCard from '@/components/PostCard'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import SubNav from '@/components/SubNav'
import { getContent } from '@/lib/content'

const categories = [
  { label: '山野行踪', href: '/blog/Tracks' },
  { label: '城市漫游', href: '/blog/City' },
  { label: '行者影像', href: '/blog/Scenery' },
]

export default async function CityPage() {
  const posts = (await getContent('blog')).filter((post) => post.category === 'City')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <header className="space-y-4 pb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">城市漫游</p>
          <h1 className="text-3xl font-semibold">以文字作为漫游的主线</h1>
          <p className="text-sm text-slate-600">让城市的光影成为文本的支点。</p>
          <SubNav items={categories} activeHref="/blog/City" />
        </header>
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
