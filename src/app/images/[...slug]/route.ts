export const runtime = 'edge'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg'])
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable'

function notFoundResponse(): Response {
  return new Response(null, {
    status: 404,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

function isValidExtension(filename: string): boolean {
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex <= 0 || dotIndex === filename.length - 1) {
    return false
  }

  return IMAGE_EXTENSIONS.has(filename.slice(dotIndex).toLowerCase())
}

function buildKey(slug: string[]): string | null {
  if (slug.length === 0) {
    return null
  }

  const filename = slug[slug.length - 1]
  if (!isValidExtension(filename)) {
    return null
  }

  // Allow arbitrary folder structure: images/a/b/c/.../file.ext
  return `images/${slug.join('/')}`
}

function redirectResponse(url: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      'Cache-Control': IMMUTABLE_CACHE,
    },
  })
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const key = buildKey(slug)
  if (!key) {
    return notFoundResponse()
  }

  const baseUrl = process.env.R2_PUBLIC_BASE_URL?.trim()
  if (!baseUrl) {
    return notFoundResponse()
  }

  const redirectUrl = `${baseUrl.replace(/\/+$/, '')}/${key}`
  return redirectResponse(redirectUrl)
}

export async function HEAD(request: Request, context: { params: Promise<{ slug: string[] }> }) {
  return GET(request, context)
}
