'use client'

import { Analytics } from '@vercel/analytics/next'

type VercelAnalyticsClientProps = {
  enabled: boolean
}

export function VercelAnalyticsClient({
  enabled,
}: VercelAnalyticsClientProps) {
  if (!enabled) {
    return null
  }

  return <Analytics />
}
