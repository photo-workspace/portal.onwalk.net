import { NextRequest } from 'next/server'
import crypto from 'node:crypto'

export const dynamic = 'force-dynamic'

import { syncMetaIndexToMarkdown } from '../../../scripts/meta-index-to-md'
import {
  deleteMetaIndexEntry,
  generateAllMarkdownFromMetaIndex,
  generateMarkdownFromMetaIndex,
  readMetaIndex,
  upsertMetaIndexEntry,
  type MetaIndexType,
} from '../../../scripts/meta-index'
import sitemap from '../sitemap'
import { listMediaItems } from '@/lib/mediaListing'


const DEFAULT_ENDPOINT = 'https://www.onwalk.net/mcp/'
const MCP_AUTH_TOKEN = process.env.WEB_SITE_MCP_ACCESS_TOKEN?.trim()

type JsonRpcRequest = {
  jsonrpc: '2.0'
  id?: number | string | null
  method: string
  params?: Record<string, unknown>
}

type JsonRpcResponse = {
  jsonrpc: '2.0'
  id: number | string | null
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

type MetaIndexToolArgs = {
  metaIndexDir?: string
  contentRoot?: string
  dryRun?: boolean
  types?: string[]
}

type MetaIndexListArgs = {
  type: MetaIndexType
}

type MetaIndexUpsertArgs = {
  type: MetaIndexType
  entry: Record<string, unknown>
}

type MetaIndexDeleteArgs = {
  type: MetaIndexType
  slug: string
}

type MetaIndexGenerateArgs = {
  type: MetaIndexType | 'all'
}

type SiteIndexArgs = {
  type: 'images' | 'videos' | 'blogs' | 'sitemap'
}

type Session = {
  controller: ReadableStreamDefaultController<Uint8Array>
  lastSeen: number
}

const encoder = new TextEncoder()
const sessions = new Map<string, Session>()

const tools = [
  {
    name: 'site.index',
    description: 'Get comprehensive site index with metadata and statistics for specific content types (images, videos, blogs) or the full sitemap. Returns summaries, counts, and recent updates.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['images', 'videos', 'blogs', 'sitemap'] },
      },
      required: ['type'],
    },
  },
  {
    name: 'meta_index_to_md',
    description:
      'Sync meta-index YAML/JSON entries into src/content Markdown files. Supports bilingual *_zh/_en fields.',
    inputSchema: {
      type: 'object',
      properties: {
        metaIndexDir: {
          type: 'string',
          description: 'Override the meta-index directory (defaults to src/content/meta-index).',
        },
        contentRoot: {
          type: 'string',
          description: 'Override the markdown content root (defaults to src/content).',
        },
        dryRun: {
          type: 'boolean',
          description: 'When true, do not write files and only report planned output.',
        },
        types: {
          type: 'array',
          items: { type: 'string' },
          description: 'Limit sync to specific content types (e.g. ["image", "video"]).',
        },
      },
    },
  },
  {
    name: 'meta_index.list',
    description: 'List meta-index entries for a type (image or video).',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['image', 'video'] },
      },
      required: ['type'],
    },
  },
  {
    name: 'meta_index.upsert',
    description: 'Create or update a meta-index entry. Entry must include a slug.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['image', 'video'] },
        entry: { type: 'object' },
      },
      required: ['type', 'entry'],
    },
  },
  {
    name: 'meta_index.delete',
    description: 'Delete a meta-index entry by slug.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['image', 'video'] },
        slug: { type: 'string' },
      },
      required: ['type', 'slug'],
    },
  },
  {
    name: 'meta_index.generate_markdown',
    description: 'Generate markdown files from meta-index entries.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['image', 'video', 'all'] },
      },
      required: ['type'],
    },
  },
]

function sendSse(controller: ReadableStreamDefaultController<Uint8Array>, event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  controller.enqueue(encoder.encode(payload))
}

function normalizeAuthorization(value: string) {
  const trimmed = value.trim()
  return trimmed.toLowerCase().startsWith('bearer ') ? trimmed.slice(7).trim() : trimmed
}

function getAuthorizationToken(request: NextRequest) {
  const headerValue = request.headers.get('authorization')
  const altHeader = request.headers.get('x-mcp-token')
  const token = request.nextUrl.searchParams.get('token')
  const raw = headerValue ?? altHeader ?? token
  if (!raw) {
    return null
  }
  return normalizeAuthorization(raw)
}

function isAuthorized(request: NextRequest) {
  if (!MCP_AUTH_TOKEN) {
    return false
  }
  const provided = getAuthorizationToken(request)
  return Boolean(provided && provided === MCP_AUTH_TOKEN)
}

function jsonRpcError(id: JsonRpcResponse['id'], message: string, data?: unknown): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32000,
      message,
      data,
    },
  }
}

function jsonRpcResult(id: JsonRpcResponse['id'], result: unknown): JsonRpcResponse {
  return { jsonrpc: '2.0', id, result }
}

function isMetaIndexType(value: unknown): value is MetaIndexType {
  return value === 'image' || value === 'video'
}

async function handleToolsCall(params: Record<string, unknown>) {
  const name = params?.name as string | undefined
  const args = (params?.arguments ?? {}) as Record<string, unknown>

  switch (name) {
    case 'site.index': {
      const payload = args as SiteIndexArgs
      if (payload.type === 'images') {
        const items = await listMediaItems('images')
        const summary = {
          total: items.length,
          withLocation: items.filter(i => i.location).length,
          recentUpdates: items
            .filter(i => i.updatedAt)
            .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
            .slice(0, 10)
            .map(i => ({ slug: i.slug, title: i.title, updatedAt: i.updatedAt })),
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ summary, items }, null, 2)
          }]
        }
      }
      if (payload.type === 'videos') {
        const items = await listMediaItems('videos')
        const summary = {
          total: items.length,
          withLocation: items.filter(i => i.location).length,
          recentUpdates: items
            .filter(i => i.updatedAt)
            .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
            .slice(0, 10)
            .map(i => ({ slug: i.slug, title: i.title, updatedAt: i.updatedAt })),
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ summary, items }, null, 2)
          }]
        }
      }
      if (payload.type === 'sitemap') {
        const result = await sitemap()
        const summary = {
          total: result.length,
          byChangeFrequency: result.reduce((acc, item) => {
            const freq = item.changeFrequency || 'unknown'
            acc[freq] = (acc[freq] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          byPriority: result.reduce((acc, item) => {
            const priority = String(item.priority || 0.5)
            acc[priority] = (acc[priority] || 0) + 1
            return acc
          }, {} as Record<string, number>),
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ summary, sitemap: result }, null, 2)
          }]
        }
      }
      if (payload.type === 'blogs') {
        // Reuse sitemap logic to get blog posts which are static files
        const fullSitemap = await sitemap()
        const blogs = fullSitemap.filter((item) => item.url.includes('/blogs/'))
        const summary = {
          total: blogs.length,
          recentUpdates: blogs
            .filter(b => b.lastModified)
            .sort((a, b) => new Date(b.lastModified!).getTime() - new Date(a.lastModified!).getTime())
            .slice(0, 10)
            .map(b => ({ url: b.url, lastModified: b.lastModified })),
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ summary, blogs }, null, 2)
          }]
        }
      }
      throw new Error(`Unknown site.index type: ${payload.type}`)
    }
    case 'meta_index_to_md': {
      const payload = args as MetaIndexToolArgs
      const results = await syncMetaIndexToMarkdown({
        metaIndexDir: payload.metaIndexDir,
        contentRoot: payload.contentRoot,
        dryRun: payload.dryRun,
        types: payload.types,
      })
      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] }
    }
    case 'meta_index.list': {
      const payload = args as MetaIndexListArgs
      if (!isMetaIndexType(payload.type)) {
        throw new Error('Invalid meta-index type.')
      }
      const entries = await readMetaIndex(payload.type)
      return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] }
    }
    case 'meta_index.upsert': {
      const payload = args as MetaIndexUpsertArgs
      if (!isMetaIndexType(payload.type)) {
        throw new Error('Invalid meta-index type.')
      }
      const entries = await upsertMetaIndexEntry(payload.type, payload.entry as any)
      return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] }
    }
    case 'meta_index.delete': {
      const payload = args as MetaIndexDeleteArgs
      if (!isMetaIndexType(payload.type)) {
        throw new Error('Invalid meta-index type.')
      }
      if (!payload.slug) {
        throw new Error('Missing slug.')
      }
      const entries = await deleteMetaIndexEntry(payload.type, payload.slug)
      return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] }
    }
    case 'meta_index.generate_markdown': {
      const payload = args as MetaIndexGenerateArgs
      if (payload.type === 'all') {
        const result = await generateAllMarkdownFromMetaIndex()
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      }
      if (!isMetaIndexType(payload.type)) {
        throw new Error('Invalid meta-index type.')
      }
      const written = await generateMarkdownFromMetaIndex(payload.type)
      return { content: [{ type: 'text', text: JSON.stringify(written, null, 2) }] }
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

async function handleJsonRpc(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  const id = request.id ?? null
  switch (request.method) {
    case 'initialize':
      return jsonRpcResult(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'onwalk-meta-index',
          version: '0.1.0',
        },
        endpoint: DEFAULT_ENDPOINT,
      })
    case 'tools/list':
      return jsonRpcResult(id, { tools })
    case 'tools/call': {
      const result = await handleToolsCall(request.params ?? {})
      return jsonRpcResult(id, result)
    }
    default:
      return jsonRpcError(id, `Unsupported method: ${request.method}`)
  }
}

function getSessionId(request: NextRequest) {
  return (
    request.headers.get('mcp-session-id') ??
    request.headers.get('x-mcp-session-id') ??
    request.nextUrl.searchParams.get('sessionId') ??
    null
  )
}

export async function GET(request: NextRequest) {
  if (!MCP_AUTH_TOKEN) {
    return new Response('MCP server is not configured.', { status: 503 })
  }
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const sessionId = crypto.randomUUID()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      sessions.set(sessionId, { controller, lastSeen: Date.now() })
      controller.enqueue(encoder.encode(': connected\n\n'))
      sendSse(controller, 'ready', { sessionId, endpoint: DEFAULT_ENDPOINT })
    },
    cancel() {
      sessions.delete(sessionId)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

export async function POST(request: NextRequest) {
  if (!MCP_AUTH_TOKEN) {
    return new Response('MCP server is not configured.', { status: 503 })
  }
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 })
  }

  let payload: JsonRpcRequest
  try {
    payload = (await request.json()) as JsonRpcRequest
  } catch (error) {
    return Response.json(jsonRpcError(null, 'Failed to parse JSON-RPC request', { error }), {
      status: 400,
    })
  }

  const response = await handleJsonRpc(payload)
  const sessionId = getSessionId(request)

  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)
    if (session) {
      session.lastSeen = Date.now()
      sendSse(session.controller, 'message', response)
      return new Response(null, { status: 202 })
    }
  }

  return Response.json(response)
}
