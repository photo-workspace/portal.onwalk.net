# MCP Server Deployment Guide

## Overview

Your MCP Server is integrated directly into the Next.js application as a Route Handler. This architecture allows it to run as a **Serverless MCP Server** directly on Vercel without needing a separate container service like Google Cloud Run.

## Architecture

- **Local Development**: `scripts/mcp-server.ts`
  - Runs in CLI/Stdio mode.
  - Connects to local processes or debug ports.
  - **NOT** for deployment.

- **Production / Deployment**: `src/app/mcp/route.ts`
  - Runs as a Next.js Route Handler (Serverless Function).
  - Exposed via HTTP at `https://www.onwalk.net/mcp/`.
  - Configured with `export const dynamic = 'force-dynamic'` to ensure correct SSE mapping and bypass Vercel caching.

## Deployment Instructions

### 1. Deploy to Vercel

Simply deploy your Next.js application to Vercel as you normally would. No special build commands or separate services are required.

```bash
git push origin main
# Vercel will auto-detect and build the Next.js app
```

### 2. Configure Environment Variables

The MCP server requires authentication to secure the endpoint. Ensure the following environment variable is set in your Vercel Project Settings:

- **Key**: `WEB_SITE_MCP_ACCESS_TOKEN`
- **Value**: <Your Secure Token>

> **Note**: This token is required for any client (like Cursor, Codex, or other AI agents) to connect to your MCP endpoint.

### 3. Verification

Once deployed, your MCP server will be available at:

```
https://www.onwalk.net/mcp/
```

You can verify it's active by making a request (providing the token):

```bash
curl -H "Authorization: Bearer <Your-Token>" https://www.onwalk.net/mcp/?sessionId=test
```

## Why Serverless?

- **Cost Efficient**: No persistent container costs; pay only for execution time.
- **Simplicity**: Unified code base and deployment pipeline.
- **Scalability**: Vercel automatically scales the function handling MCP requests.
