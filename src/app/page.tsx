export const dynamic = 'error'
export const revalidate = false

import { onwalkSeoDescription, onwalkSeoTitle } from '@/lib/seo'

export const metadata = {
  title: 'Onwalk — Walking with a Camera',
  description:
    '一个关于行走与摄影的个人长期项目。记录城市、户外与被忽略的空间细节。 A long-term personal project on walking and photography. Cities, outdoors, and overlooked details.',
}

import ImageCarousel from '@/components/ImageCarousel'
import HomeBlogList from '@/components/HomeBlogList'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import HomeVideoGrid from '@/components/HomeVideoGrid'
import HomeHero from '@/components/onwalk/HomeHero'
import HomeSectionHeader from '@/components/onwalk/HomeSectionHeader'
import { getContent } from '@/lib/content'

export default async function HomePage() {
  const [walk, image, video] = await Promise.all([
    getContent('walk'),
    getContent('image'),
    getContent('video'),
  ])

  return (
    <div className="relative min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <SiteHeader />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24">
        <HomeHero />

        <section className="space-y-6">
          <HomeSectionHeader section="blog" />
          <HomeBlogList posts={walk} />
        </section>

        <section className="space-y-6">
          <HomeSectionHeader section="image" />
          <ImageCarousel items={image} />
        </section>

        <section className="space-y-6">
          <HomeSectionHeader section="video" />
          <HomeVideoGrid items={video} />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
