import './globals.css'
import { Suspense } from 'react'
import { AppProviders } from './AppProviders'
import { ThemeToggle } from '@/components/theme'
import MobileHeader from '@/components/MobileHeader'
import MobileFooter from '@/components/MobileFooter'
import Script from 'next/script'
import { Analytics as GoogleAnalytics } from './Analytics'
import { onwalkSeoDescription, onwalkSeoTitle } from '@/lib/seo'
import { VercelAnalyticsClient } from './vercel-analytics-client'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans', // Reuse existing tailwind variable
})

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
    <html {...htmlAttributes} className={`${roboto.variable}`} suppressHydrationWarning>
      <head>
        {/* Google Fonts & Icons */}
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="" />
        {/* Product Sans (Custom) & Material Icons */}
        <link href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

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

      <body className={`${bodyClassName} pb-16 md:pb-0`}>
        <MobileHeader />
        {/* SPA 路由级 page_view */}
        <GoogleAnalytics />

        <Suspense fallback={<div />}>
          <AppProviders>
            {children}
            <ThemeToggle />
          </AppProviders>
        </Suspense>

        <VercelAnalyticsClient enabled={enableVercelAnalytics} />
        <MobileFooter />
      </body>
    </html>
  )
}
