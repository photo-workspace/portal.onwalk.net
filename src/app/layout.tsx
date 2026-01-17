import './globals.css'
import { Suspense } from 'react'
import { AppProviders } from './AppProviders'
import Script from 'next/script'
import { Analytics as GoogleAnalytics } from './Analytics'
import { onwalkSeoDescription, onwalkSeoTitle } from '@/lib/seo'
import { VercelAnalyticsClient } from './vercel-analytics-client'

const enableVercelAnalytics =
  process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === '1'

export const metadata = {
  title: onwalkSeoTitle,
  description: onwalkSeoDescription,
}

const GA_ID = 'G-P0FR8RGH87'

const htmlAttributes = { lang: 'zh' }
const bodyClassName = 'bg-[var(--color-background)] text-[var(--color-text)]'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html {...htmlAttributes}>
      <head>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />

        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              send_page_view: false
            });
          `}
        </Script>
      </head>

      <body className={bodyClassName}>
        {/* SPA 路由级 page_view */}
        <GoogleAnalytics />

        <Suspense fallback={<div />}>
          <AppProviders>
            {children}
          </AppProviders>
        </Suspense>

        <VercelAnalyticsClient enabled={enableVercelAnalytics} />
      </body>
    </html>
  )
}
