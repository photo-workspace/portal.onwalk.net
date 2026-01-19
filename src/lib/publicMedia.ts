import { unstable_cache } from 'next/cache'

import type { ContentItem } from '@/lib/content'
import { listMediaItems } from '@/lib/mediaListing'

export const getLatestPublicImages = unstable_cache(
  async (limit: number): Promise<ContentItem[]> => {
    const items = await listMediaItems('images', { limit, sort: 'latest' })
    return items.map((item, index) => ({
      ...item,
      title: item.title || `Image ${index + 1}`,
    }))
  },
  ['latest-public-images-v2'],
)

export const getLatestPublicVideos = unstable_cache(
  async (limit: number): Promise<ContentItem[]> => {
    const items = await listMediaItems('videos', { limit, sort: 'latest' })
    return items.map((item, index) => ({
      ...item,
      title: item.title || `Video ${index + 1}`,
    }))
  },
  ['latest-public-videos-v2'],
)
