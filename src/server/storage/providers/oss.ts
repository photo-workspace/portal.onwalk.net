import 'server-only'

import type { StorageClient, StorageConfig, PutObjectOptions, StorageObjectResult } from '../types'
import { buildPublicUrl, normalizeKey, stripPrefix } from '../utils'

export async function createOssClient(config: StorageConfig): Promise<StorageClient> {
  const bucketName = config.oss?.bucket ?? config.bucket
  if (!bucketName) {
    throw new Error('[storage] OSS bucket is required')
  }

  const OSSModule = await import('ali-oss')
  const OSS = OSSModule.default ?? OSSModule

  const client = new OSS({
    bucket: bucketName,
    region: config.oss?.region ?? config.region,
    endpoint: config.oss?.endpoint ?? config.endpoint,
    accessKeyId: config.credentials?.accessKeyId,
    accessKeySecret: config.credentials?.secretAccessKey,
  })

  const prefix = config.prefix

  const getObject = async (key: string): Promise<Buffer> => {
    const objectKey = normalizeKey(prefix, key)
    const result = await client.get(objectKey)
    return Buffer.isBuffer(result.content) ? result.content : Buffer.from(result.content)
  }

  const putObject = async (
    key: string,
    body: Buffer | string,
    options?: PutObjectOptions,
  ): Promise<StorageObjectResult> => {
    const objectKey = normalizeKey(prefix, key)
    await client.put(objectKey, body, {
      headers: {
        ...(options?.contentType ? { 'Content-Type': options.contentType } : {}),
        ...(options?.cacheControl ? { 'Cache-Control': options.cacheControl } : {}),
      },
    })
    return { url: buildPublicUrl(config.oss?.publicBaseUrl ?? config.publicBaseUrl, objectKey) }
  }

  const getPublicUrl = (key: string): string | undefined => {
    const objectKey = normalizeKey(prefix, key)
    return buildPublicUrl(config.oss?.publicBaseUrl ?? config.publicBaseUrl, objectKey)
  }

  const listObjects = async (listPrefix?: string): Promise<string[]> => {
    const objectPrefix = normalizeKey(prefix, listPrefix ?? '')
    const keys: string[] = []
    let continuationToken: string | undefined

    do {
      const result = await client.list({
        prefix: objectPrefix || undefined,
        marker: continuationToken,
      })
      for (const object of result.objects ?? []) {
        if (object.name) {
          keys.push(stripPrefix(prefix, object.name))
        }
      }
      continuationToken = result.nextMarker || undefined
    } while (continuationToken)

    return keys
  }

  const deleteObject = async (key: string): Promise<void> => {
    const objectKey = normalizeKey(prefix, key)
    await client.delete(objectKey)
  }

  return {
    provider: 'oss',
    getObject,
    putObject,
    getPublicUrl,
    listObjects,
    deleteObject,
  }
}
