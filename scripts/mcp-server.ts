import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js'

import { syncMetaIndexToMarkdown } from './meta-index-to-md'

type MetaIndexToolArgs = {
  metaIndexDir?: string
  contentRoot?: string
  dryRun?: boolean
  types?: string[]
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

const tools = [
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
]

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}))

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  if (request.params.name !== 'meta_index_to_md') {
    throw new Error(`Unknown tool: ${request.params.name}`)
  }

  const args = (request.params.arguments ?? {}) as MetaIndexToolArgs
  const results = await syncMetaIndexToMarkdown({
    metaIndexDir: args.metaIndexDir,
    contentRoot: args.contentRoot,
    dryRun: args.dryRun,
    types: args.types,
  })

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(results, null, 2),
      },
    ],
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error)
  process.exit(1)
})
