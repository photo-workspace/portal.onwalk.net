export const dynamic = 'error'
export const revalidate = false

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 pb-20">
        <header className="space-y-3 pb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">关于</p>
          <h1 className="text-3xl font-semibold">影像与方法论</h1>
          <p className="text-sm text-slate-600">写给未来的自己，也写给同行者。</p>
        </header>
        <div className="space-y-6 text-sm leading-relaxed text-slate-600">
          <p>我把影像当作一种长期笔记，用镜头记录城市与山野的纹理，并用文字给予它们持续生长的结构。</p>
          <p>这不是一次性的项目，而是可以长期积累的档案。照片是入口，文字是脊梁，愿它们一起陪我走得更远。</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
