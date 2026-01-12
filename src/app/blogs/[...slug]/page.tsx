export const dynamic = 'force-dynamic'

import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import BlogBackLink from '@/components/onwalk/BlogBackLink'
import { getContentBySlug, getContentSlugs } from '@/lib/content'
import { renderMarkdownContent } from '@/server/render-markdown'

type PageProps = {
  params: { slug: string | string[] }
}

const DESCRIPTION_MIN = 120
const DESCRIPTION_MAX = 160

function normalizeSlug(slugParam: string | string[]) {
  return Array.isArray(slugParam) ? slugParam.join('/') : slugParam
}

function markdownToPlainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[(.*?)\]\([^)]+\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getDescriptionText(post: { content?: string; summary?: string }) {
  const summary = typeof post.summary === 'string' ? post.summary.trim() : ''
  const rawText = summary || markdownToPlainText(post.content ?? '')

  if (rawText.length <= DESCRIPTION_MAX) {
    return rawText
  }

  const sentenceEndings = /[.!?。！？]/g
  const candidates = Array.from(rawText.matchAll(sentenceEndings))
    .map((match) => match.index ?? 0)
    .filter((index) => index >= DESCRIPTION_MIN - 1 && index < DESCRIPTION_MAX)

  if (candidates.length > 0) {
    return rawText.slice(0, candidates[candidates.length - 1] + 1).trim()
  }

  const sentences = rawText
    .split(/(?<=[.!?。！？])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  let assembled = ''
  for (const sentence of sentences) {
    const next = assembled ? `${assembled} ${sentence}` : sentence
    if (next.length > DESCRIPTION_MAX) {
      break
    }
    assembled = next
    if (assembled.length >= DESCRIPTION_MIN) {
      break
    }
  }
  if (assembled.length >= DESCRIPTION_MIN) {
    return assembled.trim()
  }

  const cutoff = rawText.lastIndexOf(' ', DESCRIPTION_MAX)
  if (cutoff > DESCRIPTION_MIN) {
    return rawText.slice(0, cutoff).trim()
  }

  return rawText.slice(0, DESCRIPTION_MAX).trim()
}

export async function generateStaticParams() {
  const slugs = await getContentSlugs('blog')
  return slugs.map((slug) => ({ slug: slug.split('/') }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slugPath = normalizeSlug(params.slug)
  const post = await getContentBySlug('blog', slugPath)

  if (!post) {
    return { title: '行摄笔记' }
  }

  return {
    title: post.title ?? '行摄笔记',
    description: getDescriptionText(post),
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const slugPath = normalizeSlug(params.slug)
  const post = await getContentBySlug('blog', slugPath)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pb-20">
        <BlogBackLink />
        <header className="mt-6 space-y-3">
          <h1 className="text-3xl font-semibold">{post.title}</h1>
          {post.date && <p className="text-xs text-slate-500">{post.date}</p>}
          {post.cover && (
            <Image
              src={post.cover}
              alt={post.title ?? post.slug}
              width={1200}
              height={800}
              sizes="100vw"
              className="mt-6 h-auto w-full rounded-2xl"
            />
          )}
        </header>
        <article
          className="prose mt-8 max-w-none text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdownContent(post.content) }}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
