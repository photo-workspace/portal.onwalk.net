import { promises as fs } from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

export type MetaIndexType = 'image' | 'video'

export type MetaIndexEntry = Record<string, unknown> & {
  slug: string
}

const META_INDEX_DIR = path.join(process.cwd(), 'src', 'content', 'meta-index')
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')

const typeToFileName: Record<MetaIndexType, string> = {
  image: 'images.json',
  video: 'videos.json',
}

function getMetaIndexPath(type: MetaIndexType) {
  return path.join(META_INDEX_DIR, typeToFileName[type])
}

function getContentDir(type: MetaIndexType) {
  return path.join(CONTENT_DIR, type)
}

export async function readMetaIndex(type: MetaIndexType): Promise<MetaIndexEntry[]> {
  const filePath = getMetaIndexPath(type)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed as MetaIndexEntry[]
    }
    return []
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function writeMetaIndex(type: MetaIndexType, entries: MetaIndexEntry[]): Promise<void> {
  await fs.mkdir(META_INDEX_DIR, { recursive: true })
  const filePath = getMetaIndexPath(type)
  await fs.writeFile(filePath, JSON.stringify(entries, null, 2))
}

export async function upsertMetaIndexEntry(type: MetaIndexType, entry: MetaIndexEntry): Promise<MetaIndexEntry[]> {
  if (!entry.slug || typeof entry.slug !== 'string') {
    throw new Error('Meta index entry requires a string slug')
  }

  const entries = await readMetaIndex(type)
  const nextEntries = entries.filter((item) => item.slug !== entry.slug)
  nextEntries.push(entry)
  nextEntries.sort((a, b) => a.slug.localeCompare(b.slug))
  await writeMetaIndex(type, nextEntries)
  return nextEntries
}

export async function deleteMetaIndexEntry(type: MetaIndexType, slug: string): Promise<MetaIndexEntry[]> {
  const entries = await readMetaIndex(type)
  const nextEntries = entries.filter((item) => item.slug !== slug)
  await writeMetaIndex(type, nextEntries)
  return nextEntries
}

function normalizeFrontmatter(entry: MetaIndexEntry, type: MetaIndexType): Record<string, unknown> {
  const frontmatter = { ...entry }
  if (type === 'image' && frontmatter.asset && !frontmatter.cover) {
    frontmatter.cover = frontmatter.asset
  }
  if (type === 'video' && frontmatter.asset && !frontmatter.src) {
    frontmatter.src = frontmatter.asset
  }
  delete frontmatter.body
  return frontmatter
}

function buildMarkdown(entry: MetaIndexEntry, type: MetaIndexType): string {
  const frontmatter = normalizeFrontmatter(entry, type)
  const frontmatterYaml = yaml.dump(frontmatter, { lineWidth: -1 }).trim()
  const body = typeof entry.body === 'string' ? entry.body.trim() : ''
  const bodyBlock = body ? `\n\n${body}\n` : '\n'
  return `---\n${frontmatterYaml}\n---${bodyBlock}`
}

export async function generateMarkdownFromMetaIndex(type: MetaIndexType): Promise<string[]> {
  const entries = await readMetaIndex(type)
  const outputDir = getContentDir(type)
  await fs.mkdir(outputDir, { recursive: true })

  const written: string[] = []

  for (const entry of entries) {
    if (!entry.slug) {
      continue
    }
    const filePath = path.join(outputDir, `${entry.slug}.md`)
    const markdown = buildMarkdown(entry, type)
    await fs.writeFile(filePath, markdown)
    written.push(filePath)
  }

  return written
}

export async function generateAllMarkdownFromMetaIndex(): Promise<Record<MetaIndexType, string[]>> {
  const [images, videos] = await Promise.all([
    generateMarkdownFromMetaIndex('image'),
    generateMarkdownFromMetaIndex('video'),
  ])

  return { image: images, video: videos }
}
