import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js'

import { syncMetaIndexToMarkdown } from './meta-index-to-md'
import {
  deleteMetaIndexEntry,
  generateAllMarkdownFromMetaIndex,
  generateMarkdownFromMetaIndex,
  readMetaIndex,
  upsertMetaIndexEntry,
  type MetaIndexType,
} from './meta-index'

type MetaIndexToolArgs = {
  metaIndexDir?: string
  contentRoot?: string
  dryRun?: boolean
  types?: string[]
  authorization?: string
  token?: string
}

type MetaIndexListArgs = {
  type: MetaIndexType
  authorization?: string
  token?: string
}

type MetaIndexUpsertArgs = {
  type: MetaIndexType
  entry: Record<string, unknown>
  authorization?: string
  token?: string
}

type MetaIndexDeleteArgs = {
  type: MetaIndexType
  slug: string
  authorization?: string
  token?: string
}

type MetaIndexGenerateArgs = {
  type: MetaIndexType | 'all'
  authorization?: string
  token?: string
}

const DEFAULT_MCP_ENDPOINT = 'https://www.onwalk.net/mcp/'
const MCP_AUTH_TOKEN = process.env.WEB_SITE_MCP_ACCESS_TOKEN?.trim()

if (!MCP_AUTH_TOKEN) {
  console.error('Missing WEB_SITE_MCP_ACCESS_TOKEN. Refusing to start MCP server.')
  process.exit(1)
}

const server = new Server(
  {
    name: 'dashboard-meta-index',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

const authorizationSchema = {
  type: 'string',
  description: 'Authorization token (supports raw token or "Bearer <token>").',
}

const tools = [
  {
    name: 'meta_index_to_md',
    description:
      'Sync meta-index YAML/JSON entries into src/content Markdown files. Supports bilingual *_zh/_en fields.',
    inputSchema: {
      type: 'object',
      properties: {
        authorization: authorizationSchema,
        token: authorizationSchema,
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
        authorization: authorizationSchema,
        token: authorizationSchema,
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
        authorization: authorizationSchema,
        token: authorizationSchema,
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
        authorization: authorizationSchema,
        token: authorizationSchema,
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
        authorization: authorizationSchema,
        token: authorizationSchema,
        type: { type: 'string', enum: ['image', 'video', 'all'] },
      },
      required: ['type'],
    },
  },
]

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}))

function normalizeAuthorization(value: string) {
  const trimmed = value.trim()
  return trimmed.toLowerCase().startsWith('bearer ') ? trimmed.slice(7).trim() : trimmed
}

function getAuthorizationToken(request: CallToolRequest): string | null {
  const params = request.params as Record<string, unknown> | undefined
  const args = (params?.arguments ?? {}) as Record<string, unknown>
  const meta = (params?.meta ?? params?.metadata ?? {}) as Record<string, unknown>
  const candidates = [
    meta.authorization,
    meta.Authorization,
    args.authorization,
    args.Authorization,
    args.token,
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return normalizeAuthorization(value)
    }
  }

  return null
}

function assertAuthorized(request: CallToolRequest) {
  if (!MCP_AUTH_TOKEN) {
    return
  }
  const provided = getAuthorizationToken(request)
  if (!provided) {
    throw new Error('Missing Authorization token.')
  }
  if (provided !== MCP_AUTH_TOKEN) {
    throw new Error('Invalid Authorization token.')
  }
}

function isMetaIndexType(value: unknown): value is MetaIndexType {
  return value === 'image' || value === 'video'
}

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  assertAuthorized(request)

  const toolName = request.params.name
  const args = (request.params.arguments ?? {}) as Record<string, unknown>

  switch (toolName) {
    case 'meta_index_to_md': {
      const payload = args as MetaIndexToolArgs
      const results = await syncMetaIndexToMarkdown({
        metaIndexDir: payload.metaIndexDir,
        contentRoot: payload.contentRoot,
        dryRun: payload.dryRun,
        types: payload.types,
      })
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      }
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
      throw new Error(`Unknown tool: ${toolName}`)
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(`MCP server running on stdio. Default endpoint: ${DEFAULT_MCP_ENDPOINT}`)
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error)
  process.exit(1)
})
