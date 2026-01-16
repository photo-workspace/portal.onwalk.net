import type { ContentItem } from '@/lib/content'
import { listMediaItems } from '@/lib/mediaListing'

export const imagesPerPage = 12

export async function getImageItems(): Promise<ContentItem[]> {
  return listMediaItems('images', { sort: 'name' })
}

export function paginateImages(items: ContentItem[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / imagesPerPage))
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const startIndex = (currentPage - 1) * imagesPerPage
  const pagedItems = items.slice(startIndex, startIndex + imagesPerPage)

  return {
    currentPage,
    totalPages,
    totalImages: items.length,
    pagedItems,
  }
}
