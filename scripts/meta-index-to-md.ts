import { promises as fs } from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

export type MetaIndexItem = {
  type: string
  slug: string
  [key: string]: unknown
}

export type MetaIndexSyncResult = {
  filePath: string
  slug: string
  type: string
  wrote: boolean
}

export type MetaIndexSyncOptions = {
  metaIndexDir?: string
  contentRoot?: string
  dryRun?: boolean
  types?: string[]
}

const DEFAULT_META_INDEX_DIR = path.join(process.cwd(), 'src', 'content', 'meta-index')
const DEFAULT_CONTENT_ROOT = path.join(process.cwd(), 'src', 'content')
const SUPPORTED_EXTENSIONS = new Set(['.yml', '.yaml', '.json'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function readMetaIndexFile(filePath: string): Promise<MetaIndexItem[]> {
  const raw = await fs.readFile(filePath, 'utf-8')
  const ext = path.extname(filePath)
  let parsed: unknown

  if (ext === '.json') {
    parsed = JSON.parse(raw)
  } else {
    parsed = yaml.load(raw)
  }

  if (Array.isArray(parsed)) {
    return parsed.filter(isRecord) as MetaIndexItem[]
  }

  if (isRecord(parsed) && Array.isArray(parsed.items)) {
    return parsed.items.filter(isRecord) as MetaIndexItem[]
  }

  return []
}

function pickBody(item: MetaIndexItem): { bodyZh: string; bodyEn?: string } {
  const bodyZh =
    (item.content_zh as string | undefined) ??
    (item.content as string | undefined) ??
    (item.body_zh as string | undefined) ??
    (item.body as string | undefined) ??
    ''
  const bodyEn =
    (item.content_en as string | undefined) ??
    (item.body_en as string | undefined)

  return { bodyZh, bodyEn }
}

function buildFrontmatter(item: MetaIndexItem, bodyZh: string, bodyEn?: string): Record<string, unknown> {
  const frontmatter: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(item)) {
    if (['type', 'slug', 'content', 'content_zh', 'content_en', 'body', 'body_zh', 'body_en'].includes(key)) {
      continue
    }
    frontmatter[key] = value
  }

  for (const [key, value] of Object.entries(item)) {
    if (!key.endsWith('_zh')) {
      continue
    }
    const baseKey = key.slice(0, -3)
    if (baseKey && frontmatter[baseKey] === undefined) {
      frontmatter[baseKey] = value
    }
  }

  if (bodyZh) {
    frontmatter.content_zh = bodyZh
  }
  if (bodyEn) {
    frontmatter.content_en = bodyEn
  }

  return frontmatter
}

async function writeMarkdownFile(
  contentRoot: string,
  item: MetaIndexItem,
  dryRun = false,
): Promise<MetaIndexSyncResult> {
  const targetDir = path.join(contentRoot, item.type)
  const outputPath = path.join(targetDir, `${item.slug}.md`)

  const { bodyZh, bodyEn } = pickBody(item)
  const frontmatter = buildFrontmatter(item, bodyZh, bodyEn)
  const yamlContent = yaml.dump(frontmatter, { lineWidth: 120, noRefs: true }).trim()
  const markdown = `---\n${yamlContent}\n---\n${bodyZh.trim()}\n`

  if (!dryRun) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, markdown)
  }

  return {
    filePath: outputPath,
    slug: item.slug,
    type: item.type,
    wrote: !dryRun,
  }
}

export async function syncMetaIndexToMarkdown(
  options: MetaIndexSyncOptions = {},
): Promise<MetaIndexSyncResult[]> {
  const metaIndexDir = options.metaIndexDir ?? DEFAULT_META_INDEX_DIR
  const contentRoot = options.contentRoot ?? DEFAULT_CONTENT_ROOT
  const types = options.types ? new Set(options.types) : undefined

  let entries: string[]
  try {
    entries = await fs.readdir(metaIndexDir)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }

  const items: MetaIndexItem[] = []
  for (const entry of entries) {
    const ext = path.extname(entry)
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      continue
    }
    const filePath = path.join(metaIndexDir, entry)
    const fileItems = await readMetaIndexFile(filePath)
    items.push(...fileItems)
  }

  const filteredItems = items.filter((item) => {
    if (!item.type || !item.slug) {
      return false
    }
    return types ? types.has(item.type) : true
  })

  const results: MetaIndexSyncResult[] = []
  for (const item of filteredItems) {
    results.push(await writeMarkdownFile(contentRoot, item, options.dryRun))
  }

  return results
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const typesArg = args.find((arg) => arg.startsWith('--types='))
  const types = typesArg ? typesArg.replace('--types=', '').split(',').map((t) => t.trim()) : undefined

  syncMetaIndexToMarkdown({ dryRun, types })
    .then((results) => {
      if (results.length === 0) {
        console.log('No meta-index entries found to sync.')
        return
      }
      console.log(
        results
          .map((result) => `${result.wrote ? 'Wrote' : 'Planned'}: ${result.type}/${result.slug}`)
          .join('\n'),
      )
    })
    .catch((error) => {
      console.error('Failed to sync meta-index entries:', error)
      process.exit(1)
    })
}
