import Link from 'next/link'
import { cookies } from 'next/headers'

import { onwalkCopy, staticHeroContent } from '@/i18n/onwalk'
import type { Language } from '@/i18n/language'

export const metadata = {
  title: `Onwalk — ${staticHeroContent.titleEn}`,
  description: staticHeroContent.subtitleEn,
}

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import HomeInteractiveWrapper from '@/components/HomeInteractiveWrapper'
import { getContent, filterPostsByLanguage } from '@/lib/content'
import { listMediaItems } from '@/lib/mediaListing'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const language = (cookieStore.get('onwalk.language')?.value || 'zh') as Language
  const copy = onwalkCopy[language] || onwalkCopy.zh

  const [blogPosts, allImages, allVideos] = await Promise.all([
    getContent('blog'),
    listMediaItems('images'),
    listMediaItems('videos'),
  ])

  const latestBlogs = filterPostsByLanguage(blogPosts, language).slice(0, 3)

  // Randomize initial media on every page load
  const initialImages = shuffleArray(allImages).slice(0, 5)
  const initialVideos = shuffleArray(allVideos).slice(0, 6)

  return (
    <div className="relative min-h-screen bg-background text-text transition-colors duration-300">
      <SiteHeader />
      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 pb-24">

        <HomeInteractiveWrapper
          initialTitle={language === 'en' ? staticHeroContent.titleEn : staticHeroContent.title}
          initialSubtitle={language === 'en' ? staticHeroContent.subtitleEn : staticHeroContent.subtitle}
          badge={copy.home.hero.badge}
          tagline={copy.home.hero.tagline}
          initialImages={initialImages}
          initialVideos={initialVideos}
          latestBlogs={latestBlogs}
        />

      </main>
      <SiteFooter />
    </div>
  )
}
