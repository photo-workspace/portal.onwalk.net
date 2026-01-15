import { Readable } from 'stream'

export function normalizeKey(prefix: string | undefined, key: string): string {
  const trimmedKey = key.replace(/^\/+/, '')
  const trimmedPrefix = prefix?.replace(/^\/+|\/+$/g, '')
  if (!trimmedPrefix) {
    return trimmedKey
  }
  if (!trimmedKey) {
    return trimmedPrefix
  }
  return `${trimmedPrefix}/${trimmedKey}`
}

export function normalizePublicBaseUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }
  return value.replace(/\/+$/, '')
}

export function buildPublicUrl(baseUrl: string | undefined, key: string): string | undefined {
  const normalized = normalizePublicBaseUrl(baseUrl)
  if (!normalized) {
    return undefined
  }
  return `${normalized}/${key.replace(/^\/+/, '')}`
}

export function stripPrefix(basePrefix: string | undefined, key: string): string {
  const trimmedPrefix = basePrefix?.replace(/^\/+|\/+$/g, '')
  if (!trimmedPrefix) {
    return key.replace(/^\/+/, '')
  }
  const normalizedKey = key.replace(/^\/+/, '')
  if (normalizedKey === trimmedPrefix) {
    return ''
  }
  if (normalizedKey.startsWith(`${trimmedPrefix}/`)) {
    return normalizedKey.slice(trimmedPrefix.length + 1)
  }
  return normalizedKey
}

export async function objectBodyToBuffer(body: unknown): Promise<Buffer> {
  if (!body) {
    throw new Error('Object body is empty')
  }

  if (typeof body === 'string') {
    return Buffer.from(body)
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body)
  }

  if (body instanceof Readable) {
    const chunks: Buffer[] = []
    for await (const chunk of body) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk))
    }
    return Buffer.concat(chunks)
  }

  if (body instanceof Blob) {
    const arrayBuffer = await body.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  if (typeof (body as ReadableStream<Uint8Array>).getReader === 'function') {
    const reader = (body as ReadableStream<Uint8Array>).getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }
      if (value) {
        chunks.push(value)
      }
    }
    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))
  }

  throw new Error('Unsupported object body type')
}
