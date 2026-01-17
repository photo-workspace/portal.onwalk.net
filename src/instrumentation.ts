import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

let sdk: NodeSDK | undefined

export async function register() {
  if (process.env.OTEL_ENABLED !== '1') {
    return
  }

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  if (!endpoint) {
    return
  }

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]:
        process.env.OTEL_SERVICE_NAME || 'portal.onwalk.net',
    }),
    traceExporter: new OTLPTraceExporter({
      url: endpoint,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  })

  await sdk.start()
}

export async function shutdown() {
  if (sdk) {
    await sdk.shutdown()
  }
}
