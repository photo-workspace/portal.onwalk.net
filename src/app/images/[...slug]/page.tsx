import ImagesGallery from '../ImagesGallery'
import { getImageItems, paginateImages } from '../image-data'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumb, BreadcrumbItem } from '@/components/Breadcrumb'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

type Props = {
    params: Promise<{ slug: string[] }>
}

function generateImageBreadcrumbs(slugSegments: string[], isExactMatch: boolean = false): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
        { name: '首页', path: '/' },
        { name: '瞬间', path: '/images' },
    ]

    let currentPath = '/images'
    const segments = isExactMatch ? slugSegments.slice(0, -1) : slugSegments

    segments.forEach((segment) => {
        currentPath += `/${segment}`
        // Capitalize first letter for display
        const name = segment.charAt(0).toUpperCase() + segment.slice(1)
        items.push({
            name,
            path: currentPath,
        })
    })

    return items
}

function getDirectoryTitle(slugSegments: string[]): string {
    if (slugSegments.length === 0) return 'Images'
    const lastSegment = slugSegments[slugSegments.length - 1]
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const pathStr = slug.join('/')
    const items = await getImageItems()

    // Check if it's an exact item match
    const exactMatch = items.find(i => i.slug === pathStr)

    if (exactMatch) {
        return {
            title: `${exactMatch.title} | Onwalk`,
            description: exactMatch.location
                ? (Array.isArray(exactMatch.location) ? exactMatch.location.join(', ') : exactMatch.location)
                : `Image: ${exactMatch.title}`,
            alternates: {
                canonical: `/images/${pathStr}`,
            },
            openGraph: {
                images: [`/api/og?type=image&slug=${encodeURIComponent(pathStr)}`],
            },
            twitter: {
                card: 'summary_large_image',
                images: [`/api/og?type=image&slug=${encodeURIComponent(pathStr)}`],
            },
            robots: {
                index: true,
                follow: true,
            },
        }
    }

    // This is a directory/category page
    const directoryTitle = getDirectoryTitle(slug)
    return {
        title: `${directoryTitle} - 瞬间 | Onwalk`,
        description: `Browse images in ${directoryTitle} category.`,
        alternates: {
            canonical: `/images/${pathStr}`,
        },
        openGraph: {
            title: `${directoryTitle} - 瞬间 | Onwalk`,
            description: `Browse images in ${directoryTitle} category.`,
            images: [`/api/og?type=image&slug=${encodeURIComponent(pathStr)}`],
        },
        twitter: {
            card: 'summary_large_image',
            images: [`/api/og?type=image&slug=${encodeURIComponent(pathStr)}`],
        },
        robots: {
            index: true,
            follow: true,
        },
    }
}

export default async function ImagesDataPage({
    params,
}: Props) {
    const { slug } = await params
    const items = await getImageItems()

    // 1. Analyze Slug
    // Check for pagination at the end (e.g. /images/china/2 or /images/2)
    const lastSegment = slug[slug.length - 1]
    const isLastNumeric = /^\d+$/.test(lastSegment)

    let pageNumber = 1
    let categoryPath = ''

    if (isLastNumeric) {
        pageNumber = parseInt(lastSegment, 10)
        // Remove page number from path
        categoryPath = slug.slice(0, -1).join('/')
    } else {
        categoryPath = slug.join('/')
    }

    // 2. Filter Items Logic
    let filteredItems = items
    let initialSlug: string | undefined = undefined

    // Check if exact match (Deep Link to Item)
    // Only if NOT numeric (pagination takes precedence if conflict? e.g. item named "2")
    // Convention: numeric is page. Item named "2" is ambiguous but unlikely for "clean" slug.
    const exactMatch = !isLastNumeric ? items.find(i => i.slug === categoryPath) : undefined

    if (exactMatch) {
        // It IS an item.
        // Strategy: Show Gallery containing this item's context (e.g. its directory)
        // or Show ALL items with this item selected.
        // Let's filter by the parent directory to keep context relevant.
        const parentDir = categoryPath.split('/').slice(0, -1).join('/')

        if (parentDir) {
            filteredItems = items.filter(i => i.slug.startsWith(parentDir + '/'))
        }
        // If no parentDir (root item), filteredItems is already all items.

        initialSlug = exactMatch.slug
        // If we are showing a specific item, we want to ensure it's on the current page?
        // `ImagesGallery` computes display items based on pagination. 
        // If we provide `initialSlug`, we should probably adjust `currentPage`?
        // But `ImagesGallery` handles selection logic. 
        // If we pass `pagedItems` that DOES NOT include the item, the Modal won't find it if it relies on `items` prop?
        // `ImagesGallery` uses `items` prop for the Grid.
        // If the item is on Page 5, and we render Page 1, it won't be in the grid.
        // BUT `ImagesGallery` implementation of `selectedItem` uses `sortedItems.find`.
        // `sortedItems` is derived from `items` (which is `pagedItems` passed in).
        // WAIT! `src/app/images/[page]/page.tsx` passed `pagedItems`.
        // `ImagesGallery` logic:
        // Line 107: `const currentItems = (externalTotalImages !== undefined) ? sortedItems : ...`
        // If we pass `items={pagedItems}`, `sortedItems` is just those 12 items.
        // If `initialSlug` is not in those 12, `selectedItem` will be null!

        // FIX: If it is a DETAIL VIEW, we should probably pass ALL relevant items (filtered by category) 
        // and let Client Side handle pagination?
        // OR calculate which page the item is on.
        // Calculating page is hard because Client sorts by default "latest".
        // `getImageItems` returns "latest" (see `image-data.ts`).
        // So server order matches client default order.
        // We can find the index and determine page.

        // Let's assume server order = client order ('latest').
        // Find index of exactMatch in filteredItems.
        const index = filteredItems.findIndex(i => i.slug === exactMatch.slug)
        if (index >= 0) {
            pageNumber = Math.floor(index / 12) + 1
        }
        // Pass this pageNumber.
    } else if (categoryPath) {
        // Not an exact item match. Treat as Category / Folder.
        // Filter items that start with categoryPath + '/'
        // e.g. path 'china', items 'china/foo', 'china/bar'
        filteredItems = items.filter(i => i.slug.startsWith(categoryPath + '/') || i.slug === categoryPath)
        // (include exact match if it was a folder?? No, slug is clean file path.)

        // Allow empty directories to be shown with breadcrumbs
        // Don't 404 on empty directories
    }

    // 3. Paginate
    const { currentPage, totalPages, totalImages, pagedItems } = paginateImages(
        filteredItems,
        Number.isNaN(pageNumber) ? 1 : pageNumber,
    )

    const breadcrumbs = generateImageBreadcrumbs(slug, !!exactMatch)
    const directoryTitle = getDirectoryTitle(exactMatch ? slug.slice(0, -1) : slug)

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <SiteHeader />
            <main className="mx-auto w-full max-w-7xl px-6 pb-20">
                <Breadcrumb items={breadcrumbs} />

                {filteredItems.length === 0 ? (
                    <div className="mt-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">{directoryTitle}</h1>
                        <p className="text-slate-500">此目录暂无内容。</p>
                    </div>
                ) : (
                    <ImagesGallery
                        items={pagedItems}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalImages={totalImages}
                        initialSlug={initialSlug}
                    />
                )}
            </main>
            <SiteFooter />
        </div>
    )
}
