import fs from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
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

export const getContent = cache(async (type: ContentType): Promise<ContentItem[]> => {
  try {
    return await readMarkdownFiles(type)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
    return []
  }
})

export const getContentBySlug = cache(async (type: ContentType, slug: string): Promise<ContentItem | undefined> => {
  const items = await getContent(type)
  return items.find((item) => item.slug === slug)
})

export const getContentSlugs = cache(async (type: ContentType): Promise<string[]> => {
  const items = await getContent(type)
  return items.map((item) => item.slug)
})
