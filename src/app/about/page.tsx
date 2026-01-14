
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import AboutContent from '@/components/onwalk/AboutContent'
import { getPreferredLanguage } from '@/server/language'

export default async function AboutPage() {
  const language = await getPreferredLanguage()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 pb-20">
        <AboutContent language={language} />
      </main>
      <SiteFooter />
    </div>
  )
}
