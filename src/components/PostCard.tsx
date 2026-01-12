import Image from 'next/image'
import Link from 'next/link'

import type { ContentItem } from '@/lib/content'

function buildExcerpt(content: string): string {
  const cleaned = content
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[`*_>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.slice(0, 120)
}

export default function PostCard({ post }: { post: ContentItem }) {
  const href = `/blogs/${post.slug}`

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4">
        {post.cover && (
          <Link href={href} aria-label={post.title ?? post.slug}>
            <Image
              src={post.cover}
              alt={post.title ?? post.slug}
              width={1200}
              height={800}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-48 w-full rounded-xl object-cover"
            />
          </Link>
        )}
        <div>
          <h2 className="text-xl font-semibold">
            <Link href={href} className="hover:underline">
              {post.title}
            </Link>
          </h2>
          {post.date && <p className="mt-1 text-xs text-slate-500">{post.date}</p>}
        </div>
        {post.content && <p className="text-sm text-slate-600">{buildExcerpt(post.content)}...</p>}
        <Link href={href} className="text-sm font-semibold text-brand hover:text-brand-dark">
          阅读 →
        </Link>
      </div>
    </article>
  )
}
