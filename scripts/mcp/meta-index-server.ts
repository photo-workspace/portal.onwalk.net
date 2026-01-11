import { createInterface } from 'node:readline'
import { stdin, stdout } from 'node:process'

import {
  deleteMetaIndexEntry,
  generateAllMarkdownFromMetaIndex,
  generateMarkdownFromMetaIndex,
  readMetaIndex,
  upsertMetaIndexEntry,
} from '../meta-index'

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

const tools = [
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

function sendResponse(response: JsonRpcResponse) {
  stdout.write(`${JSON.stringify(response)}\n`)
}

function sendResult(id: JsonRpcResponse['id'], result: unknown) {
  sendResponse({ jsonrpc: '2.0', id, result })
}

function sendError(id: JsonRpcResponse['id'], message: string, data?: unknown) {
  sendResponse({
    jsonrpc: '2.0',
    id,
    error: {
      code: -32000,
      message,
      data,
    },
  })
}

async function handleToolsCall(params: Record<string, unknown>) {
  const name = params?.name as string | undefined
  const args = (params?.arguments ?? {}) as Record<string, unknown>

  switch (name) {
    case 'meta_index.list': {
      const type = args.type as 'image' | 'video'
      const entries = await readMetaIndex(type)
      return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] }
    }
    case 'meta_index.upsert': {
      const type = args.type as 'image' | 'video'
      const entry = args.entry as Record<string, unknown>
      const entries = await upsertMetaIndexEntry(type, entry as any)
      return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] }
    }
    case 'meta_index.delete': {
      const type = args.type as 'image' | 'video'
      const slug = args.slug as string
      const entries = await deleteMetaIndexEntry(type, slug)
      return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] }
    }
    case 'meta_index.generate_markdown': {
      const type = args.type as 'image' | 'video' | 'all'
      if (type === 'all') {
        const result = await generateAllMarkdownFromMetaIndex()
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      }
      const written = await generateMarkdownFromMetaIndex(type)
      return { content: [{ type: 'text', text: JSON.stringify(written, null, 2) }] }
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

async function handleRequest(request: JsonRpcRequest) {
  const id = request.id ?? null

  try {
    switch (request.method) {
      case 'initialize':
        sendResult(id, {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'onwalk-meta-index',
            version: '0.1.0',
          },
        })
        return
      case 'tools/list':
        sendResult(id, { tools })
        return
      case 'tools/call': {
        const result = await handleToolsCall(request.params ?? {})
        sendResult(id, result)
        return
      }
      default:
        sendError(id, `Unsupported method: ${request.method}`)
    }
  } catch (error) {
    sendError(id, (error as Error).message)
  }
}

const reader = createInterface({ input: stdin, crlfDelay: Infinity })

reader.on('line', (line) => {
  if (!line.trim()) {
    return
  }
  try {
    const request = JSON.parse(line) as JsonRpcRequest
    void handleRequest(request)
  } catch (error) {
    sendError(null, 'Failed to parse JSON-RPC request', { line, error: (error as Error).message })
  }
})

console.error('Onwalk meta-index MCP server running on stdio (JSON line protocol)')
