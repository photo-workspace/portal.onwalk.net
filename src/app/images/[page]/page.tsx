import ImagesGallery from '../ImagesGallery'
import { getImageFiles, imagesPerPage, paginateImages } from '../image-data'


export async function generateStaticParams() {
  const files = await getImageFiles()
  const totalPages = Math.max(1, Math.ceil(files.length / imagesPerPage))

  return Array.from({ length: totalPages }, (_, index) => ({
    page: String(index + 1),
  }))
}

export default async function ImagesPagedPage({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const files = await getImageFiles()
  const { page } = await params
  const pageNumber = Number.parseInt(page, 10)
  const { currentPage, totalPages, totalImages, pagedFiles } = paginateImages(
    files,
    Number.isNaN(pageNumber) ? 1 : pageNumber,
  )

  return (
    <ImagesGallery
      files={pagedFiles}
      currentPage={currentPage}
      totalPages={totalPages}
      totalImages={totalImages}
    />
  )
}
