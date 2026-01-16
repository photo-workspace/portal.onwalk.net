import { NextResponse } from 'next/server'

import { loadRuntimeConfig } from '@server/runtime-loader'

export async function GET(request: Request) {
  const runtimeConfig = loadRuntimeConfig()

  const payload = {
    status: 'ok' as const,
    environment: runtimeConfig.environment,
    region: runtimeConfig.region,
    apiBaseUrl: runtimeConfig.apiBaseUrl,
    authUrl: runtimeConfig.authUrl,
    dashboardUrl: runtimeConfig.dashboardUrl,
    logLevel: runtimeConfig.logLevel,
  }

  console.info('[runtime-config] /api/ping resolved config snippet', payload)

  return NextResponse.json(payload)
}
