import fs from 'node:fs/promises'
import path from 'node:path'

import type { ContentItem } from '@/lib/content'
import { getStorageClient } from '@/server/storage'

export type MediaKind = 'images' | 'videos'
export type MediaSort = 'latest' | 'name'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'])
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm'])

const slugToTitle = (slug: string) => slug.replace(/[-_]+/g, ' ').trim()

function getExtensions(kind: MediaKind): Set<string> {
  return kind === 'images' ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS
}

function getLocalDir(kind: MediaKind): string {
  return path.join(process.cwd(), 'public', kind)
}

function getFilenameFromKey(key: string): string {
  const normalized = key.replace(/\\/g, '/')
  const parts = normalized.split('/')
  return parts[parts.length - 1] || normalized
}

function normalizeStorageSlug(kind: MediaKind, key: string): string | null {
  const normalized = key.replace(/\\/g, '/').replace(/^\/+/, '')
  if (!normalized) {
    return null
  }

  const publicPrefix = `public/${kind}/`
  if (normalized.startsWith(publicPrefix)) {
    return normalized.slice(publicPrefix.length)
  }

  const kindPrefix = `${kind}/`
  if (normalized.startsWith(kindPrefix)) {
    return normalized.slice(kindPrefix.length)
  }

  return normalized
}

async function getFilesRecursively(dir: string, extensions: Set<string>, rootDir: string = dir): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    let results: string[] = []

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results = results.concat(await getFilesRecursively(fullPath, extensions, rootDir))
      } else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
        results.push(path.relative(rootDir, fullPath))
      }
    }
    return results
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

async function listLocalFiles(kind: MediaKind, sort: MediaSort): Promise<string[]> {
  const directory = getLocalDir(kind)
  const extensions = getExtensions(kind)

  const names = await getFilesRecursively(directory, extensions)

  if (sort === 'name') {
    return names.sort((a, b) => a.localeCompare(b, 'en'))
  }

  // Need to get Stats for mtime sorting
  const files = await Promise.all(
    names.map(async (name) => {
      const stats = await fs.stat(path.join(directory, name))
      return { name, mtimeMs: stats.mtimeMs }
    }),
  )

  return files
    .sort((a, b) => {
      if (b.mtimeMs !== a.mtimeMs) return b.mtimeMs - a.mtimeMs
      return a.name.localeCompare(b.name, 'en')
    })
    .map((file) => file.name)
}

async function listStorageKeys(kind: MediaKind): Promise<string[] | null> {
  try {
    const client = await getStorageClient()
    const keys = await client.listObjects(kind)
    const extensions = getExtensions(kind)
    const filtered = keys.filter((key) => extensions.has(path.extname(key).toLowerCase()))
    return filtered
  } catch {
    return null
  }
}

async function listStorageItems(kind: MediaKind, sort: MediaSort): Promise<ContentItem[] | null> {
  const keys = await listStorageKeys(kind)
  if (!keys) {
    return null
  }

  const baseUrl = process.env.R2_PUBLIC_BASE_URL?.trim()
  if (!baseUrl) {
    return null
  }

  const normalizedKeys = keys
    .map((key) => ({ key, slug: normalizeStorageSlug(kind, key) }))
    .filter((item): item is { key: string; slug: string } => Boolean(item.slug))

  const sorted = [...normalizedKeys].sort((a, b) => {
    if (sort === 'name') {
      return a.slug.localeCompare(b.slug, 'en')
    }
    return b.slug.localeCompare(a.slug, 'en')
  })

  const items: ContentItem[] = []
  for (const entry of sorted) {
    const urlPath = `/${kind}/${entry.slug}`
    const filename = getFilenameFromKey(entry.slug)
    const titleSlug = filename.replace(/\.[^.]+$/, '')
    const title = slugToTitle(titleSlug)
    items.push({
      slug: entry.slug,
      title,
      content: '',
      ...(kind === 'images' ? { cover: urlPath } : { src: urlPath }),
    })
  }

  return items.length ? items : []
}

function buildLocalItem(kind: MediaKind, filename: string): ContentItem {
  // filename is potentially a nested path e.g. "china/xinjiang/foo.jpg"
  // For title, we want just the filename part to keep UI clean
  const nameOnly = getFilenameFromKey(filename)
  const titleSlug = nameOnly.replace(/\.[^.]+$/, '')
  const title = slugToTitle(titleSlug)

  // URL must include the full path
  // Ensure we use forward slashes for URL even on Windows
  const urlPath = filename.replace(/\\/g, '/')
  const url = `/${kind}/${urlPath}`

  return {
    slug: filename, // Use full path as slug for uniqueness
    title,
    content: '',
    ...(kind === 'images' ? { cover: url } : { src: url }),
  }
}

async function listLocalItems(kind: MediaKind, sort: MediaSort): Promise<ContentItem[]> {
  const files = await listLocalFiles(kind, sort)
  return files.map((filename) => buildLocalItem(kind, filename))
}

export async function listMediaItems(
  kind: MediaKind,
  options?: { limit?: number; sort?: MediaSort },
): Promise<ContentItem[]> {
  const sort = options?.sort ?? 'name'
  const limit = options?.limit

  /*
   * Environment Control for Local Media Fallback:
   * - Default: Disabled (strictly object storage)
   * - Override: ENABLE_LOCAL_MEDIA_FALLBACK="true" forces it ON in any env.
   */
  const envEnableLocalRaw = process.env.ENABLE_LOCAL_MEDIA_FALLBACK
  const isLocalEnabled = envEnableLocalRaw === 'true' || envEnableLocalRaw === '1'

  const [storageItems, localItems] = await Promise.all([
    listStorageItems(kind, sort),
    isLocalEnabled ? listLocalItems(kind, sort) : Promise.resolve([]),
  ])

  const allItems = [...(storageItems ?? []), ...(localItems)]

  // Re-sort the combined list since they were sorted individually
  // ContentItem.title is optional, so we use slug for consistent sorting
  allItems.sort((a, b) => {
    const valA = a.slug
    const valB = b.slug

    // Simple alpha sort on slug
    if (sort === 'name') {
      return valA.localeCompare(valB, 'en')
    }

    // For 'latest' or other sorts, we fallback to reverse alpha of slug
    // because we don't have mtime for storage items easily available in ContentItem interface
    return valB.localeCompare(valA, 'en')
  })

  if (limit !== undefined) {
    return allItems.slice(0, limit)
  }

  return allItems
}
