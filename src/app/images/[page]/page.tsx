import ImagesGallery from '../ImagesGallery'
import { getImageItems, paginateImages } from '../image-data'

export default async function ImagesPagedPage({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const items = await getImageItems()
  const { page } = await params
  const pageNumber = Number.parseInt(page, 10)
  const { currentPage, totalPages, totalImages, pagedItems } = paginateImages(
    items,
    Number.isNaN(pageNumber) ? 1 : pageNumber,
  )

  return (
    <ImagesGallery
      items={pagedItems}
      currentPage={currentPage}
      totalPages={totalPages}
      totalImages={totalImages}
    />
  )
}
