import 'server-only'

import type { StorageClient, StorageConfig, PutObjectOptions, StorageObjectResult } from '../types'
import { buildPublicUrl, normalizeKey, stripPrefix } from '../utils'

export async function createGcsClient(config: StorageConfig): Promise<StorageClient> {
  const bucketName = config.gcs?.bucket ?? config.bucket
  if (!bucketName) {
    throw new Error('[storage] GCS bucket is required')
  }

  const { Storage } = await import('@google-cloud/storage')

  const credentialsJson = config.gcs?.credentialsJson
  const credentials = credentialsJson ? JSON.parse(credentialsJson) : undefined

  const storage = new Storage({
    projectId: config.gcs?.projectId,
    credentials,
  })

  const bucket = storage.bucket(bucketName)
  const prefix = config.prefix

  const getObject = async (key: string): Promise<Buffer> => {
    const objectKey = normalizeKey(prefix, key)
    const [contents] = await bucket.file(objectKey).download()
    return contents
  }

  const putObject = async (
    key: string,
    body: Buffer | string,
    options?: PutObjectOptions,
  ): Promise<StorageObjectResult> => {
    const objectKey = normalizeKey(prefix, key)
    await bucket.file(objectKey).save(body, {
      contentType: options?.contentType,
      metadata: {
        cacheControl: options?.cacheControl,
        ...options?.metadata,
      },
      resumable: false,
    })
    return { url: buildPublicUrl(config.gcs?.publicBaseUrl ?? config.publicBaseUrl, objectKey) }
  }

  const getPublicUrl = (key: string): string | undefined => {
    const objectKey = normalizeKey(prefix, key)
    return buildPublicUrl(config.gcs?.publicBaseUrl ?? config.publicBaseUrl, objectKey)
  }

  const listObjects = async (listPrefix?: string): Promise<string[]> => {
    const objectPrefix = normalizeKey(prefix, listPrefix ?? '')
    const [files] = await bucket.getFiles({ prefix: objectPrefix || undefined })
    return files.map((file) => stripPrefix(prefix, file.name))
  }

  const deleteObject = async (key: string): Promise<void> => {
    const objectKey = normalizeKey(prefix, key)
    await bucket.file(objectKey).delete({ ignoreNotFound: true })
  }

  return {
    provider: 'gcs',
    getObject,
    putObject,
    getPublicUrl,
    listObjects,
    deleteObject,
  }
}
