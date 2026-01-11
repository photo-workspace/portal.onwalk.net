import Link from 'next/link'
import type { ContentItem } from '@/lib/content'

function buildExcerpt(content: string): string {
  const cleaned = content
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[`*_>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.slice(0, 160) // Slightly longer for 2 lines
}

export default function HomeBlogList({ posts }: { posts: ContentItem[] }) {
  // Display only top 5 posts
  const displayPosts = posts.slice(0, 5)

  return (
    <div className="flex flex-col gap-4">
      {displayPosts.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group block rounded-xl border border-gray-100 bg-white p-6 transition-colors hover:bg-[#F2F2F2]"
        >
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              {post.date ? new Date(post.date).toLocaleDateString() : 'Recent'}
            </span>
            <h3 className="text-xl font-medium text-[var(--color-heading)] group-hover:text-black">
              {post.title}
            </h3>
            {post.content && (
              <p className="line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {buildExcerpt(post.content)}
              </p>
            )}
          </div>
        </Link>
      ))}
      <div className="mt-4">
        <Link
          href="/blog"
          className="block w-full rounded-full border border-gray-300 py-3 text-center text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-gray-400 hover:text-[var(--color-text)]"
        >
          Read More
        </Link>
      </div>
    </div>
  )
}
