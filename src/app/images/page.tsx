import type { Metadata } from 'next'

import ImagesGallery from './ImagesGallery'
import { getImageFiles, paginateImages } from './image-data'

export const metadata: Metadata = {
  title: '影像 | Onwalk',
  description: 'Onwalk 影像集，展示城市、户外与航拍摄影作品。',
  alternates: {
    canonical: '/images',
  },
}

export default async function ImagesPage() {
  const files = await getImageFiles()
  const { currentPage, totalPages, totalImages, pagedFiles } = paginateImages(files, 1)

  return (
    <ImagesGallery
      files={pagedFiles}
      currentPage={currentPage}
      totalPages={totalPages}
      totalImages={totalImages}
    />
  )
}
