export type StorageProvider = 's3' | 'gcs' | 'oss' | 'r2'

export type StorageCredentials = {
  accessKeyId?: string
  secretAccessKey?: string
  sessionToken?: string
}

export type StorageConfig = {
  provider: StorageProvider
  bucket?: string
  region?: string
  endpoint?: string
  prefix?: string
  publicBaseUrl?: string
  credentials?: StorageCredentials
  s3?: {
    forcePathStyle?: boolean
  }
  gcs?: {
    projectId?: string
    bucket?: string
    publicBaseUrl?: string
    credentialsJson?: string
  }
  oss?: {
    endpoint?: string
    bucket?: string
    region?: string
    publicBaseUrl?: string
  }
  r2?: {
    endpoint?: string
    bucket?: string
    region?: string
    publicBaseUrl?: string
  }
}

export type PutObjectOptions = {
  contentType?: string
  cacheControl?: string
  metadata?: Record<string, string>
  access?: 'public' | 'private'
}

export type StorageObjectResult = {
  url?: string
}

export interface StorageClient {
  provider: StorageProvider
  getObject: (key: string) => Promise<Buffer>
  putObject: (key: string, body: Buffer | string, options?: PutObjectOptions) => Promise<StorageObjectResult>
  getPublicUrl: (key: string) => string | undefined
  listObjects: (prefix?: string) => Promise<string[]>
  deleteObject: (key: string) => Promise<void>
}
