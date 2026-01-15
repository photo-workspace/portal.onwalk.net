import 'server-only'

import type { StorageClient, StorageConfig, PutObjectOptions, StorageObjectResult } from '../types'
import { buildPublicUrl, normalizeKey, objectBodyToBuffer, stripPrefix } from '../utils'

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

export async function createVercelBlobClient(config: StorageConfig): Promise<StorageClient> {
  const { get, put, del, list } = await import('@vercel/blob')

  const token = config.vercel?.token
  const access = config.vercel?.access ?? 'public'
  const prefix = config.prefix

  const getObject = async (key: string): Promise<Buffer> => {
    const objectKey = normalizeKey(prefix, key)
    const url = isUrl(objectKey) ? objectKey : buildPublicUrl(config.publicBaseUrl, objectKey)
    if (!url) {
      throw new Error('[storage] Vercel Blob requires publicBaseUrl or full URL key for getObject')
    }
    const result = await get(url, { token })
    if (result instanceof Response) {
      return Buffer.from(await result.arrayBuffer())
    }
    if (typeof (result as Blob).arrayBuffer === 'function') {
      const blob = result as Blob
      return Buffer.from(await blob.arrayBuffer())
    }
    return objectBodyToBuffer(result)
  }

  const putObject = async (
    key: string,
    body: Buffer | string,
    options?: PutObjectOptions,
  ): Promise<StorageObjectResult> => {
    const objectKey = normalizeKey(prefix, key)
    const result = await put(objectKey, body, {
      access: options?.access ?? access,
      contentType: options?.contentType,
      token,
    })
    return { url: result.url }
  }

  const getPublicUrl = (key: string): string | undefined => {
    const objectKey = normalizeKey(prefix, key)
    return buildPublicUrl(config.publicBaseUrl, objectKey)
  }

  const listObjects = async (listPrefix?: string): Promise<string[]> => {
    const objectPrefix = normalizeKey(prefix, listPrefix ?? '')
    const keys: string[] = []
    let cursor: string | undefined

    do {
      const result = await list({ cursor, limit: 1000, prefix: objectPrefix || undefined, token })
      for (const item of result.blobs) {
        keys.push(stripPrefix(prefix, item.pathname))
      }
      cursor = result.cursor ?? undefined
    } while (cursor)

    return keys
  }

  const deleteObject = async (key: string): Promise<void> => {
    const objectKey = normalizeKey(prefix, key)
    await del([objectKey], { token })
  }

  return {
    provider: 'vercel',
    getObject,
    putObject,
    getPublicUrl,
    listObjects,
    deleteObject,
  }
}
