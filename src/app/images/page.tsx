import type { Metadata } from 'next'

import ImagesGallery from './ImagesGallery'
import { getImageItems, paginateImages } from './image-data'

export const metadata: Metadata = {
  title: '影像 | Onwalk',
  description: 'Onwalk 影像集，展示城市、户外与航拍摄影作品。',
  alternates: {
    canonical: '/images',
  },
}

export default async function ImagesPage() {
  const items = await getImageItems()
  const { currentPage, totalPages, totalImages, pagedItems } = paginateImages(items, 1)

  return (
    <ImagesGallery
      items={pagedItems}
      currentPage={currentPage}
      totalPages={totalPages}
      totalImages={totalImages}
    />
  )
}
