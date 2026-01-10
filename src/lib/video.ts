import fs from 'node:fs/promises'
import path from 'node:path'

import type { ContentItem } from '@/lib/content'

const VIDEO_DIR = path.join(process.cwd(), 'public', 'videos')

const slugToTitle = (slug: string) => slug.replace(/[-_]+/g, ' ').trim()

export async function getPublicVideos(): Promise<ContentItem[]> {
  try {
    const entries = await fs.readdir(VIDEO_DIR, { withFileTypes: true })
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.mp4'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b))

    return files.map((file) => {
      const slug = file.replace(/\.mp4$/i, '')
      return {
        slug,
        title: slugToTitle(slug),
        src: `/videos/${file}`,
        content: '',
      }
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}
