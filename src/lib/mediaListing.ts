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

async function listLocalFiles(kind: MediaKind, sort: MediaSort): Promise<string[]> {
  const directory = getLocalDir(kind)
  const extensions = getExtensions(kind)

  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const names = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => extensions.has(path.extname(name).toLowerCase()))

    if (sort === 'name') {
      return names.sort((a, b) => a.localeCompare(b, 'en'))
    }

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
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
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

  const client = await getStorageClient()
  if (keys.length > 0 && !client.getPublicUrl(keys[0])) {
    return null
  }
  const sorted = [...keys].sort((a, b) => {
    if (sort === 'name') {
      return a.localeCompare(b, 'en')
    }
    return b.localeCompare(a, 'en')
  })

  const items: ContentItem[] = []
  for (const key of sorted) {
    const url = client.getPublicUrl(key)
    if (!url) {
      continue
    }

    const filename = getFilenameFromKey(key)
    const slug = filename.replace(/\.[^.]+$/, '')
    const title = slugToTitle(slug)
    items.push({
      slug: key,
      title,
      content: '',
      ...(kind === 'images' ? { cover: url } : { src: url }),
    })
  }

  return items.length ? items : []
}

function buildLocalItem(kind: MediaKind, filename: string): ContentItem {
  const slug = filename.replace(/\.[^.]+$/, '')
  const title = slugToTitle(slug)
  const url = `/${kind}/${filename}`

  return {
    slug: filename,
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

  const storageItems = await listStorageItems(kind, sort)
  const items = (storageItems && storageItems.length > 0) ? storageItems : (await listLocalItems(kind, sort))

  if (limit !== undefined) {
    return items.slice(0, limit)
  }

  return items
}
