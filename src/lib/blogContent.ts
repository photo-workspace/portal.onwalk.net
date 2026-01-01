import fs from 'fs/promises'
import { cache } from 'react'

import { readMdxDirectory, readMdxFile } from './mdx'
import { resolveBlogContentRoot } from './marketingContent'

export interface BlogPost {
  slug: string
  title: string
  author?: string
  date?: string
  tags: string[]
  excerpt: string
  content: string
  category?: {
    key: string
    label: string
  }
}

export interface BlogCategory {
  key: string
  label: string
}

export type BlogPostSummary = Omit<BlogPost, 'content'>

const BLOG_EXTENSIONS = ['.md', '.mdx']

const CATEGORY_MAP: { key: string; label: string; match: (segments: string[]) => boolean }[] = [
  { key: 'infra-cloud', label: 'Infra & Cloud', match: (segments) => segments[0] === '04-infra-platform' },
  { key: 'observability', label: 'Observability', match: (segments) => segments[0] === '03-observability' },
  { key: 'identity', label: 'ID & Security', match: (segments) => segments[0] === '01-id-security' },
  { key: 'iac-devops', label: 'IaC & DevOps', match: (segments) => segments[0] === '02-iac-devops' },
  { key: 'data-ai', label: 'Data & AI', match: (segments) => segments[0] === '05-data-ai' },
  { key: 'workshops', label: 'Workshops', match: (segments) => segments[0] === '06-workshops' },
  {
    key: 'insight',
    label: '资讯',
    match: (segments) => segments[0] === '00-global' && (!segments[1] || segments[1] === 'news' || segments[1] === 'workshops'),
  },
  {
    key: 'essays',
    label: '随笔&观察',
    match: (segments) => segments[0] === '00-global' && segments[1] === 'essays',
  },
]

const CATEGORY_DIRECTORIES: Record<string, { key: string; label: string }> = {
  '04-infra-platform': { key: 'infra-cloud', label: 'Infra & Cloud' },
  '03-observability': { key: 'observability', label: 'Observability' },
  '01-id-security': { key: 'identity', label: 'ID & Security' },
  '02-iac-devops': { key: 'iac-devops', label: 'IaC & DevOps' },
  '05-data-ai': { key: 'data-ai', label: 'Data & AI' },
  '00-global': { key: 'insight', label: '资讯' },
  '06-workshops': { key: 'workshops', label: 'Workshops' },
}

const readBlogFiles = cache(async () =>
  readMdxDirectory('', {
    baseDir: resolveBlogContentRoot(),
    recursive: true,
    extensions: BLOG_EXTENSIONS,
  }),
)

export const getBlogCategories = cache(async (): Promise<BlogCategory[]> => {
  try {
    const contentRoot = resolveBlogContentRoot()
    const entries = await fs.readdir(contentRoot, { withFileTypes: true })
    const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)

    return directories
      .sort()
      .map((dirName) => {
        const mapped = CATEGORY_DIRECTORIES[dirName]
        if (mapped) return mapped

        const withoutPrefix = dirName.replace(/^\d+-/, '')
        const normalized = withoutPrefix
          .split('-')
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ')

        return { key: dirName, label: normalized || dirName }
      })
      .filter((category, index, self) => self.findIndex((item) => item.key === category.key) === index)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
    return []
  }
})

function resolveCategory(slug: string): { key: string; label: string } | undefined {
  const segments = slug.split('/')
  const matched = CATEGORY_MAP.find((category) => category.match(segments))

  return matched ? { key: matched.key, label: matched.label } : undefined
}

function buildExcerpt(markdown: string): string {
  const cleaned = markdown
    .replace(/^\s*import\s+.*$/gm, '')
    .replace(/^\s*export\s+const\s+.*$/gm, '')
    .trim()

  const blocks = cleaned.split(/\r?\n\s*\r?\n/)
  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue
    const withoutFormatting = trimmed
      .replace(/^#+\s*/g, '')
      .replace(/[`*_>\[\]]/g, '')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    if (withoutFormatting.trim()) {
      return withoutFormatting.trim()
    }
  }
  return ''
}

function normalizeHeadingText(value: string): string {
  return value
    .replace(/[`*_]/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .trim()
}

function extractTitleFromContent(markdown: string): { title?: string; content: string } {
  const lines = markdown.split(/\r?\n/)
  let firstContentLine = 0

  while (firstContentLine < lines.length && lines[firstContentLine].trim() === '') {
    firstContentLine += 1
  }

  if (firstContentLine < lines.length) {
    const match = lines[firstContentLine].match(/^#{1,6}\s+(.*)$/)
    if (match && match[1]?.trim()) {
      const title = normalizeHeadingText(match[1])
      const content = [...lines.slice(0, firstContentLine), ...lines.slice(firstContentLine + 1)].join('\n')
      return { title, content }
    }
  }

  return { content: markdown }
}

function normalizePost(file: Awaited<ReturnType<typeof readBlogFiles>>[number]): BlogPost {
  const metadataTitle = typeof file.metadata.title === 'string' ? file.metadata.title : undefined
  const { title: derivedTitle, content } = metadataTitle
    ? { title: undefined, content: file.content }
    : extractTitleFromContent(file.content)
  const title = metadataTitle ?? derivedTitle ?? file.slug
  const author = typeof file.metadata.author === 'string' ? file.metadata.author : undefined
  const date = typeof file.metadata.date === 'string' ? file.metadata.date : undefined
  const tags = Array.isArray(file.metadata.tags)
    ? file.metadata.tags.filter((tag): tag is string => typeof tag === 'string')
    : []
  const excerpt = typeof file.metadata.excerpt === 'string' ? file.metadata.excerpt : buildExcerpt(content)
  const categoryKey = typeof file.metadata.category === 'string' ? file.metadata.category : undefined
  const categoryLabel = typeof file.metadata.categoryLabel === 'string' ? file.metadata.categoryLabel : categoryKey
  const category =
    categoryKey && categoryLabel
      ? { key: categoryKey, label: categoryLabel }
      : resolveCategory(file.slug)

  return {
    slug: file.slug,
    title,
    author,
    date,
    tags,
    excerpt,
    content,
    category,
  }
}

export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  try {
    const files = await readBlogFiles()
    const posts = files.map(normalizePost).filter((post) => post.content.trim().length > 0)

    return posts
      .map((post) => ({
        ...post,
        dateValue: post.date ? new Date(post.date) : undefined,
      }))
      .sort((a, b) => {
        if (a.dateValue && b.dateValue) {
          return b.dateValue.getTime() - a.dateValue.getTime()
        }
        if (a.dateValue) return -1
        if (b.dateValue) return 1
        return a.title.localeCompare(b.title)
      })
      .map(({ dateValue: _dateValue, ...post }) => post)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
    return []
  }
})

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts()
  return posts.find((post) => post.slug === slug)
}

export async function getBlogSlugs(): Promise<string[]> {
  const posts = await getBlogPosts()
  return posts.map((post) => post.slug)
}

export async function loadBlogContent(slug: string): Promise<string> {
  const contentRoot = resolveBlogContentRoot()
  const file = await readMdxFile(slug, { baseDir: contentRoot, extensions: BLOG_EXTENSIONS })
  return file.content
}
