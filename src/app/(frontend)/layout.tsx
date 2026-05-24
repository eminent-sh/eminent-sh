import React from 'react'
import Script from 'next/script'
import './styles.css'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

export const metadata = {
  description: 'The index of ventures by EMINENT MEDIA LLC.',
  title: 'Bespoke Solutions by EMINENT',
  icons: {
    icon: 'https://media.eminent.sh/favicon.ico',
    apple: 'https://media.eminent.sh/apple-touch-icon.png',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const analyticsId = process.env.ANALYTICS_ID

  return (
    <html lang="en">
      <body>
        {analyticsId ? (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsId}');
              `}
            </Script>
          </>
        ) : null}
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
