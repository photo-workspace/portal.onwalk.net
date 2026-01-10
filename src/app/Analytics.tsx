'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const GA_MEASUREMENT_ID = 'G-Z621W698Q6'

export function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || !window.gtag) {
      return
    }

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pathname,
      anonymize_ip: true,
    })
  }, [pathname])

  return null
}
