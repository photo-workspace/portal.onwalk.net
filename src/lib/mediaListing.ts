import fs from 'node:fs/promises'
import path from 'node:path'

import type { ContentItem } from '@/lib/content'

export type MediaKind = 'images' | 'videos'
export type MediaSort = 'latest' | 'name'

// Defined in scripts/generate-media-index.py
interface MediaIndexItem {
  path: string
  ext: string
  type: 'image' | 'video'
  updatedAt?: string
  location?: string
  views?: number
}

export function getMediaIndexPath(kind: MediaKind): string {
  return path.join(process.cwd(), 'public', '_media', `${kind}.json`)
}

async function readMediaIndex(kind: MediaKind): Promise<MediaIndexItem[]> {
  try {
    const indexPath = getMediaIndexPath(kind)
    const content = await fs.readFile(indexPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Failed to read media index for ${kind}:`, error)
    return []
  }
}

export async function listMediaItems(
  kind: MediaKind,
  options?: { limit?: number; sort?: MediaSort },
): Promise<ContentItem[]> {
  const indexItems = await readMediaIndex(kind)

  // Transform to ContentItem
  let baseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL
  if (!baseUrl) {
    console.warn('NEXT_PUBLIC_MEDIA_BASE_URL is not defined')
    baseUrl = ''
  }

  // Normalize baseUrl to remove trailing slash
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1)
  }

  // Canonical URL rule: ${MEDIA_BASE_URL}/images/${path}
  const items: ContentItem[] = indexItems.map((item) => {
    // Determine the base path segment based on kind
    // e.g. kind='images' -> url = .../images/...
    const url = `${baseUrl}/${kind}/${item.path}`

    // Title from filename (simple heuristic)
    const filename = path.basename(item.path)
    const title = filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()

    return {
      slug: item.path,
      title,
      updatedAt: item.updatedAt,
      location: item.location,
      views: item.views,
      content: '', // No content for media items
      ...(kind === 'images' ? { cover: url } : { src: url }),
    }
  })

  // Sort
  const sort = options?.sort ?? 'name'

  if (sort === 'name') {
    items.sort((a, b) => a.slug.localeCompare(b.slug, 'en'))
  } else {
    // 'latest' sort
    items.sort((a, b) => {
      // Use updatedAt if available
      if (a.updatedAt && b.updatedAt) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      // Fallback to path reverse for robustness
      return b.slug.localeCompare(a.slug, 'en')
    })
  }

  if (options?.limit) {
    return items.slice(0, options.limit)
  }

  return items
}
