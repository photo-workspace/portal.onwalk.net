import type { ContentItem } from '@/lib/content'
import { listMediaItems } from '@/lib/mediaListing'

export async function getPublicVideos(): Promise<ContentItem[]> {
  return listMediaItems('videos', { sort: 'name' })
}
