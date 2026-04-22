import React from 'react'
import './styles.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

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

  return (
    <html lang="en">
      <body>
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
