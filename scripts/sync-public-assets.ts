import path from 'path'
import { promises as fs } from 'fs'

import { getStorageClient } from '../src/server/storage'

type CliOptions = {
  dryRun: boolean
  prefix?: string
  cacheControl?: string
  deleteExtra: boolean
}

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const IGNORED_BASENAMES = new Set(['.DS_Store'])

const CONTENT_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.md': 'text/markdown',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.css': 'text/css',
  '.txt': 'text/plain',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.xml': 'application/xml',
  '.html': 'text/html',
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    deleteExtra: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }
    if (arg === '--delete') {
      options.deleteExtra = true
      continue
    }
    if (arg === '--prefix') {
      options.prefix = argv[i + 1]
      i += 1
      continue
    }
    if (arg === '--cache-control') {
      options.cacheControl = argv[i + 1]
      i += 1
      continue
    }
  }

  return options
}

function resolveTargetKey(prefix: string | undefined, relativePath: string): string {
  if (!prefix) {
    return relativePath
  }
  return `${prefix.replace(/\/+$/, '')}/${relativePath}`
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    if (IGNORED_BASENAMES.has(entry.name)) {
      continue
    }
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)))
    } else if (entry.isFile()) {
      files.push(fullPath)
    }
  }

  return files
}

function resolveContentType(filePath: string): string | undefined {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()]
}

async function syncAssets(options: CliOptions): Promise<void> {
  const storage = await getStorageClient()

  const files = await collectFiles(PUBLIC_DIR)
  if (files.length === 0) {
    console.info('[sync-public-assets] No files found under public/')
    return
  }

  const localKeys = new Set<string>()
  for (const filePath of files) {
    const relativePath = path.relative(PUBLIC_DIR, filePath).split(path.sep).join('/')
    localKeys.add(resolveTargetKey(options.prefix, relativePath))
  }

  let uploaded = 0
  for (const filePath of files) {
    const relativePath = path.relative(PUBLIC_DIR, filePath).split(path.sep).join('/')
    const targetKey = resolveTargetKey(options.prefix, relativePath)
    const contentType = resolveContentType(filePath)

    if (options.dryRun) {
      console.info(`[sync-public-assets] DRY RUN upload: ${relativePath} -> ${targetKey}`)
      uploaded += 1
      continue
    }

    const body = await fs.readFile(filePath)
    await storage.putObject(targetKey, body, {
      contentType,
      cacheControl: options.cacheControl,
    })
    uploaded += 1
  }

  let deleted = 0
  if (options.deleteExtra) {
    const remoteKeys = await storage.listObjects(options.prefix)
    for (const key of remoteKeys) {
      if (!localKeys.has(key)) {
        if (options.dryRun) {
          console.info(`[sync-public-assets] DRY RUN delete: ${key}`)
        } else {
          await storage.deleteObject(key)
        }
        deleted += 1
      }
    }
  }

  const deleteSuffix = options.deleteExtra ? `, deleted ${deleted}` : ''
  console.info(`[sync-public-assets] Uploaded ${uploaded} files to ${storage.provider}${deleteSuffix}`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  try {
    await syncAssets(options)
  } catch (error) {
    console.error('[sync-public-assets] Failed to sync public assets', error)
    process.exitCode = 1
  }
}

void main()
