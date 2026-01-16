import fs from 'fs'
import path from 'path'

import yaml from 'js-yaml'

// 使用 process.cwd() 获取项目根目录，避免 __dirname 在生产环境的问题
const configDir = path.join(process.cwd(), 'src', 'config')

const FORBIDDEN_IMPORT_CONTEXTS = [
  `${path.sep}src${path.sep}components${path.sep}ui${path.sep}`,
  'tiptap',
  'mermaid',
  'next-themes',
]

function assertServerOnlyContext() {
  if (typeof window !== 'undefined') {
    throw new Error('runtime-loader.ts is server-only and cannot run in the browser.')
  }

  if (process.env.NODE_ENV !== 'production') {
    const stack = new Error().stack ?? ''
    const forbiddenCaller = FORBIDDEN_IMPORT_CONTEXTS.find((pattern) => stack.includes(pattern))

    if (forbiddenCaller) {
      throw new Error(
        `[runtime-config] runtime-loader.ts must not be imported alongside UI/editor runtimes (${forbiddenCaller}).`,
      )
    }
  }
}

assertServerOnlyContext()

function loadYamlSource(sourceKey: RuntimeSourceKey): string | undefined {
  try {
    const filePath = path.join(configDir, `runtime-service-config.${sourceKey}.yaml`)
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    console.warn(`[runtime-config] Failed to load YAML source "${sourceKey}"`, error)
    return undefined
  }
}

type RuntimeSourceKey = 'base' | 'prod' | 'sit'

export type RuntimeEnvironment = 'prod' | 'sit'
export type RuntimeRegion = 'default' | 'cn' | 'global'

export type RuntimeConfig = {
  apiBaseUrl?: string
  authUrl?: string
  dashboardUrl?: string
  internalApiBaseUrl?: string
  logLevel?: string
  [key: string]: unknown
} & {
  environment: RuntimeEnvironment
  region: RuntimeRegion
  source: RuntimeSourceKey
  hostname?: string
  detectedBy: string
}

export type RuntimeEnvSettings = {
  environment: RuntimeEnvironment
  region: RuntimeRegion
  detectedBy: string
}

const RUNTIME_ENV_CONFIG_BASENAME = '.runtime-env-config.yaml'

// 动态加载 YAML 源文件，避免 Turbopack 编译问题
function getYamlSource(sourceKey: RuntimeSourceKey): string | undefined {
  return loadYamlSource(sourceKey)
}

const parsedYamlCache: Partial<Record<RuntimeSourceKey, Record<string, unknown>>> = {}
const runtimeConfigCache = new Map<string, RuntimeConfig>()

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]'])

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function resolveEnvReferences(value: unknown, pathSegments: string[] = []): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) => resolveEnvReferences(item, [...pathSegments, String(index)]))
  }

  if (isPlainRecord(value)) {
    const keys = Object.keys(value)
    if (keys.length === 1 && keys[0] === 'env' && typeof value.env === 'string') {
      const envKey = value.env
      const envValue = process.env[envKey]
      if (envValue === undefined) {
        const pathLabel = pathSegments.length ? pathSegments.join('.') : '<root>'
        console.warn(`[runtime-config] Missing env ${envKey} at ${pathLabel}`)
      }
      return envValue
    }

    const resolved: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value)) {
      resolved[key] = resolveEnvReferences(nested, [...pathSegments, key])
    }
    return resolved
  }

  return value
}

function parseYamlSource(sourceKey: RuntimeSourceKey): Record<string, unknown> {
  if (parsedYamlCache[sourceKey]) {
    return parsedYamlCache[sourceKey]!
  }

  const source = getYamlSource(sourceKey)
  if (!source) {
    return {}
  }

  try {
    const parsed = yaml.load(source)
    if (isPlainRecord(parsed)) {
      const resolved = resolveEnvReferences(parsed)
      if (isPlainRecord(resolved)) {
        parsedYamlCache[sourceKey] = resolved
        return resolved
      }

      console.warn(
        `[runtime-config] YAML source "${sourceKey}" did not resolve to an object. Falling back to empty object.`,
      )
    }

    console.warn(
      `[runtime-config] YAML source "${sourceKey}" did not produce an object. Falling back to empty object.`,
    )
  } catch (error) {
    console.warn(
      `[runtime-config] Failed to parse YAML source "${sourceKey}", falling back to empty object.`,
      error,
    )
  }

  parsedYamlCache[sourceKey] = {}
  return parsedYamlCache[sourceKey]!
}

function mergeConfigs(base: Record<string, unknown>, override?: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  const assignValue = (target: Record<string, unknown>, key: string, value: unknown) => {
    if (Array.isArray(value)) {
      target[key] = value.map((item) => (isPlainRecord(item) ? mergeConfigs({}, item) : item))
      return
    }

    if (isPlainRecord(value)) {
      const existing = isPlainRecord(target[key]) ? (target[key] as Record<string, unknown>) : {}
      target[key] = mergeConfigs(existing, value)
      return
    }

    target[key] = value
  }

  for (const [key, value] of Object.entries(base)) {
    assignValue(result, key, value)
  }

  if (!override) {
    return result
  }

  for (const [key, value] of Object.entries(override)) {
    assignValue(result, key, value)
  }

  return result
}

function sanitizeHostname(value?: string): string | undefined {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const maybeUrl = trimmed.match(/^https?:\/\//i) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(maybeUrl)
    return url.hostname
  } catch (error) {
    console.warn('[runtime-config] Failed to parse hostname value', error)
    return undefined
  }
}

function getRuntimeEnvConfigPath(): string {
  return path.join(process.cwd(), RUNTIME_ENV_CONFIG_BASENAME)
}

function detectEnvSettings(): RuntimeEnvSettings {
  const runtimeEnvPath = getRuntimeEnvConfigPath()

  try {
    const contents = fs.readFileSync(runtimeEnvPath, 'utf8')
    const parsed = yaml.load(contents)
    if (isPlainRecord(parsed)) {
      const environment = parsed.environment
      const region = parsed.region
      if (environment === 'prod' || environment === 'sit') {
        const runtimeRegion = region === 'cn' || region === 'global' ? region : 'default'
        return {
          environment,
          region: runtimeRegion,
          detectedBy: runtimeEnvPath,
        }
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`[runtime-config] Failed to load ${RUNTIME_ENV_CONFIG_BASENAME}`, error)
    }
  }

  const nodeEnv = process.env.RUNTIME_ENV === 'sit' ? 'sit' : 'prod'
  const regionEnv =
    process.env.REGION === 'cn' || process.env.REGION === 'global' ? process.env.REGION : 'default'

  return {
    environment: nodeEnv,
    region: regionEnv,
    detectedBy: 'env',
  }
}

function resolveHostname(): string | undefined {
  const envHostname = sanitizeHostname(process.env.RUNTIME_HOSTNAME)
  if (envHostname) {
    return envHostname
  }

  const envUrl = sanitizeHostname(process.env.NEXT_PUBLIC_DASHBOARD_URL)
  if (envUrl) {
    return envUrl
  }

  if (typeof process.env.VERCEL_URL === 'string') {
    return sanitizeHostname(process.env.VERCEL_URL)
  }

  return undefined
}

export function loadRuntimeConfig(): RuntimeConfig {
  const cacheKey = JSON.stringify({
    env: process.env.RUNTIME_ENV,
    region: process.env.REGION,
    hostname: process.env.RUNTIME_HOSTNAME,
    vercelUrl: process.env.VERCEL_URL,
    dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_URL,
  })

  const cached = runtimeConfigCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const envSettings = detectEnvSettings()
  const hostname = resolveHostname()
  const baseConfig = parseYamlSource('base')

  const envConfig = parseYamlSource(envSettings.environment)
  const runtimeConfig = mergeConfigs(baseConfig, envConfig)

  const hostOverrides = runtimeConfig.hosts
  if (isPlainRecord(hostOverrides) && hostname) {
    const hostnameConfig = hostOverrides[hostname]
    if (isPlainRecord(hostnameConfig)) {
      Object.assign(runtimeConfig, mergeConfigs(runtimeConfig, hostnameConfig))
    } else if (!LOCAL_HOSTNAMES.has(hostname)) {
      console.warn(`[runtime-config] No host overrides found for "${hostname}"`)
    }
  }

  runtimeConfig.environment = envSettings.environment
  runtimeConfig.region = envSettings.region
  runtimeConfig.source = envSettings.environment
  runtimeConfig.hostname = hostname
  runtimeConfig.detectedBy = envSettings.detectedBy

  runtimeConfigCache.set(cacheKey, runtimeConfig as RuntimeConfig)
  return runtimeConfig as RuntimeConfig
}
