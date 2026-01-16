import 'server-only'

import { loadRuntimeConfig, type RuntimeConfig } from '../runtime-loader.shared'
import { createGcsClient } from './providers/gcs'
import { createOssClient } from './providers/oss'
import { createS3Client } from './providers/s3'
import type { StorageClient, StorageConfig, StorageProvider } from './types'

const storageClientCache = new Map<string, StorageClient>()

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseStorageConfig(runtimeConfig: RuntimeConfig): StorageConfig {
  const storage = (runtimeConfig as RuntimeConfig & { storage?: unknown }).storage
  if (!isPlainRecord(storage)) {
    throw new Error('[storage] Missing storage config')
  }
  if (typeof storage.provider !== 'string') {
    throw new Error('[storage] storage.provider is required')
  }
  return storage as StorageConfig
}

function storageCacheKey(config: StorageConfig): string {
  return [
    config.provider,
    config.bucket ?? '',
    config.region ?? '',
    config.endpoint ?? '',
    config.prefix ?? '',
    config.publicBaseUrl ?? '',
  ].join('|')
}

export async function createStorageClient(config: StorageConfig): Promise<StorageClient> {
  const cacheKey = storageCacheKey(config)
  const cached = storageClientCache.get(cacheKey)
  if (cached) {
    return cached
  }

  let client: StorageClient
  switch (config.provider as StorageProvider) {
    case 's3':
      client = createS3Client(config)
      break
    case 'r2': {
      const mergedConfig = {
        ...config,
        publicBaseUrl: config.r2?.publicBaseUrl ?? config.publicBaseUrl,
        bucket: config.r2?.bucket ?? config.bucket,
        region: config.r2?.region ?? config.region,
        endpoint: config.r2?.endpoint ?? config.endpoint,
      }
      const s3Client = createS3Client(mergedConfig)
      client = { ...s3Client, provider: 'r2' }
      break
    }
    case 'gcs':
      client = await createGcsClient(config)
      break
    case 'oss':
      client = await createOssClient(config)
      break
    default:
      throw new Error(`[storage] Unsupported provider: ${String(config.provider)}`)
  }

  storageClientCache.set(cacheKey, client)
  return client
}

export async function getStorageClient(): Promise<StorageClient> {
  const runtimeConfig = loadRuntimeConfig()
  const storageConfig = parseStorageConfig(runtimeConfig)
  return createStorageClient(storageConfig)
}

export type { StorageClient, StorageConfig } from './types'
