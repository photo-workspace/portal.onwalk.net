export const dynamic = 'error'

import './globals.css'
import { AppProviders } from './AppProviders'
import Script from 'next/script'
import { Analytics } from './Analytics'

export const metadata = {
  title: 'Cloud-Neutral',
  description: 'Unified tools for your cloud native stack',
}

const htmlAttributes = { lang: 'zh' }
const bodyClassName = 'bg-[var(--color-background)] text-[var(--color-text)]'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html {...htmlAttributes}>
      <body className={bodyClassName}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z621W698Q6"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-Z621W698Q6', { anonymize_ip: true });`}
        </Script>
        <Analytics />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
