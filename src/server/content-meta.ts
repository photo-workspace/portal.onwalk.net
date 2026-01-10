import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

import { assertContentFile, ContentNotFoundError, toContentRelativePath } from './content-utils'

const execFileAsync = promisify(execFile)

export interface ContentCommitMeta {
  path: string
  updatedAt?: string
  author?: string
  message?: string
  commit?: string
}

export async function getContentCommitMeta(requestPath: string): Promise<ContentCommitMeta> {
  const absolutePath = await assertContentFile(requestPath)
  const repoRoot = await findGitRoot(absolutePath)
  if (!repoRoot) {
    return {
      path: toContentRelativePath(absolutePath),
    }
  }

  const relativeToRepo = path.relative(repoRoot, absolutePath)

  try {
    const { stdout } = await execFileAsync(
      'git',
      ['log', '-1', '--pretty=format:%H%x00%ct%x00%an%x00%s', '--', relativeToRepo],
      { cwd: repoRoot }
    )

    if (!stdout.trim()) {
      return {
        path: toContentRelativePath(absolutePath),
      }
    }

    const [commit, timestamp, author, message] = stdout.trim().split('\0')
    const updatedAt = timestamp ? new Date(Number(timestamp) * 1000).toISOString() : undefined

    return {
      path: toContentRelativePath(absolutePath),
      commit,
      updatedAt,
      author: author || undefined,
      message: message || undefined,
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { stderr?: string }
    if (err.code === 'ENOENT') {
      throw new ContentNotFoundError(`Content file not found: ${requestPath}`)
    }
    if (err.code === '128' || err.stderr?.includes('unknown revision') || err.stderr?.includes('fatal')) {
      return {
        path: toContentRelativePath(absolutePath),
      }
    }
    throw error
  }
}

async function findGitRoot(filePath: string): Promise<string | null> {
  let currentDir = path.dirname(filePath)
  const root = path.parse(currentDir).root
  const ignoredRoots = [
    path.resolve(process.cwd(), 'src'),
    path.resolve(process.cwd(), 'src', 'content'),
  ]

  while (currentDir && currentDir !== root) {
    try {
      const gitPath = path.join(currentDir, '.git')
      const stat = await fs.stat(gitPath)
      if ((stat.isDirectory() || stat.isFile()) && !isIgnoredGitRoot(currentDir, ignoredRoots)) {
        return currentDir
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
    currentDir = path.dirname(currentDir)
  }
  return null
}

function isIgnoredGitRoot(currentDir: string, ignoredRoots: string[]): boolean {
  const resolved = path.resolve(currentDir)
  return ignoredRoots.some((ignored) => resolved === ignored || resolved.startsWith(`${ignored}${path.sep}`))
}

export { ContentNotFoundError }
