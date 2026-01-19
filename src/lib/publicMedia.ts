
import fs from 'node:fs/promises'
import path from 'node:path'

import type { ContentItem } from '@/lib/content'
import { getMediaIndexPath, listMediaItems } from '@/lib/mediaListing'

// Helper to handle file-based caching with invalidation based on source file mtime
async function getCachedData<T>(
  cacheKey: string,
  sourceFilePath: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cacheDir = path.join(process.cwd(), 'public', '_media')
  const cacheFile = path.join(cacheDir, `${cacheKey}.cache.json`)

  try {
    // 1. Check if cache exists
    const [cacheStats, sourceStats] = await Promise.all([
      fs.stat(cacheFile).catch(() => null),
      fs.stat(sourceFilePath).catch(() => null),
    ])

    if (cacheStats && sourceStats) {
      // 2. Check if cache is fresh (cache mtime >= source mtime)
      // We add a small buffer (e.g. 100ms) or just strict compare.
      // If source is newer, we re-fetch.
      if (cacheStats.mtimeMs >= sourceStats.mtimeMs) {
        const cacheContent = await fs.readFile(cacheFile, 'utf-8')
        return JSON.parse(cacheContent)
      }
    }
  } catch (error) {
    // Ignore cache read errors, proceed to fetch
    console.warn('Cache read failed, re-fetching:', error)
  }

  // 3. Fetch fresh data
  const data = await fetcher()

  // 4. Write to cache (fire and forget or await? await to ensure consistency if needed, but for perf maybe okay.
  // actually for this use case, let's await to ensure we don't have race conditions on initial load if possible,
  // though node is single threaded. safe to await.)
  try {
    await fs.writeFile(cacheFile, JSON.stringify(data), 'utf-8')
  } catch (error) {
    console.error('Failed to write cache:', error)
  }

  return data
}

export const getLatestPublicImages = async (limit: number): Promise<ContentItem[]> => {
  return getCachedData(
    `latest_images_${limit}`,
    getMediaIndexPath('images'),
    async () => {
      const items = await listMediaItems('images', { limit, sort: 'latest' })
      return items.map((item, index) => ({
        ...item,
        title: item.title || `Image ${index + 1}`,
      }))
    },
  )
}

export const getLatestPublicVideos = async (limit: number): Promise<ContentItem[]> => {
  return getCachedData(
    `latest_videos_${limit}`,
    getMediaIndexPath('videos'),
    async () => {
      const items = await listMediaItems('videos', { limit, sort: 'latest' })
      return items.map((item, index) => ({
        ...item,
        title: item.title || `Video ${index + 1}`,
      }))
    },
  )
}
