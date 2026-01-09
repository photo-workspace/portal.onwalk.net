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

async function readMarkdownFiles(type: ContentType): Promise<ContentItem[]> {
  const dir = path.join(CONTENT_DIR, type)
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))

  const items = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file.name)
      const raw = await fs.readFile(filePath, 'utf8')
      const { data, content } = matter(raw)
      return {
        slug: file.name.replace(/\.md$/, ''),
        ...(data as Record<string, unknown>),
        content,
      } as ContentItem
    }),
  )

  return items
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
