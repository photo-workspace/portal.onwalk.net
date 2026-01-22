import type { Metadata } from 'next'

import ImagesGallery from './ImagesGallery'
import { getImageItems, paginateImages } from './image-data'

export const metadata: Metadata = {
  title: '影像 | Onwalk',
  description: 'Onwalk 影像集，展示城市、户外与航拍摄影作品。',
  alternates: {
    canonical: '/images',
  },
  openGraph: {
    title: '影像 | Onwalk',
    description: 'Onwalk 影像集，展示城市、户外与航拍摄影作品。',
    url: 'https://www.onwalk.net/images',
    siteName: 'Onwalk',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '影像 | Onwalk',
    description: 'Onwalk 影像集，展示城市、户外与航拍摄影作品。',
  },
}

export default async function ImagesPage() {
  const items = await getImageItems()

  return (
    <ImagesGallery items={items} />
  )
}
