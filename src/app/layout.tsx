export const dynamic = 'error'

import './globals.css'
import { AppProviders } from './AppProviders'
import Script from 'next/script'
import { Analytics } from './Analytics'

export const metadata = {
  title:
    '摄影 | 户外 | 航拍 | 富士 GFX | 大疆无人机 个人主页 | www.onwalk.net | Photography | Outdoor | Aerial | Fujifilm GFX | DJI Drone Personal Homepage | www.onwalk.net',
  description:
    '摄影 | 户外 | 航拍 | 富士 GFX | 大疆无人机 个人主页 | www.onwalk.net | Photography | Outdoor | Aerial | Fujifilm GFX | DJI Drone Personal Homepage | www.onwalk.net',
}

const GA_ID = 'G-Z621W698Q6'

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
        <Analytics />

        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
