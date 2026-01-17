import fs from 'node:fs/promises'
import path from 'node:path'
import { unstable_cache } from 'next/cache'
import matter from 'gray-matter'

export type ContentType = 'walk' | 'image' | 'video' | 'blog'

export type ContentItem = {
  slug: string
  type?: string
  title?: string
  date?: string
  cover?: string
  poster?: string
  src?: string
  equipment?: string
  location?: string | string[]
  duration?: string
  category?: string
  content: string
}

const CONTENT_DIR = path.join(process.cwd(), 'src/content')

type MarkdownEntry = {
  filePath: string
  slug: string
}

async function collectMarkdownEntries(dir: string, rootDir: string): Promise<MarkdownEntry[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const results: MarkdownEntry[] = []

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await collectMarkdownEntries(entryPath, rootDir)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(rootDir, entryPath).replace(/\\/g, '/')
      results.push({
        filePath: entryPath,
        slug: relativePath.replace(/\.md$/, ''),
      })
    }
  }

  return results
}

async function readMarkdownFiles(type: ContentType): Promise<ContentItem[]> {
  const dir = path.join(CONTENT_DIR, type)
  const entries = await collectMarkdownEntries(dir, dir)

  const items = await Promise.all(
    entries.map(async (entry) => {
      const raw = await fs.readFile(entry.filePath, 'utf8')
      const { data, content } = matter(raw)
      return {
        slug: entry.slug,
        ...(data as Record<string, unknown>),
        content,
      } as ContentItem
    }),
  )

  return items.sort((a, b) => a.slug.localeCompare(b.slug))
}

export const getContent = async (type: ContentType): Promise<ContentItem[]> => {
  try {
    return await readMarkdownFiles(type)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
    return []
  }
}

export const getContentBySlug = async (
  type: ContentType,
  slug: string,
): Promise<ContentItem | undefined> => {
  const items = await getContent(type)
  return items.find((item) => item.slug === slug)
}

export const getContentSlugs = async (type: ContentType): Promise<string[]> => {
  const items = await getContent(type)
  return items.map((item) => item.slug)
}

export function sortContentByDate(items: ContentItem[]): ContentItem[] {
  return [...items].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0
    const bTime = b.date ? new Date(b.date).getTime() : 0
    const safeATime = Number.isNaN(aTime) ? 0 : aTime
    const safeBTime = Number.isNaN(bTime) ? 0 : bTime
    if (safeATime === safeBTime) {
      return a.slug.localeCompare(b.slug)
    }
    return safeBTime - safeATime
  })
}
