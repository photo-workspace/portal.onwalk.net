export const dynamic = 'error'
export const revalidate = false

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import AboutContent from '@/components/onwalk/AboutContent'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 pb-20">
        <AboutContent />
      </main>
      <SiteFooter />
    </div>
  )
}
