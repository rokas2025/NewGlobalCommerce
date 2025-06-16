import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { Providers } from '@/lib/providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Global Commerce',
    template: '%s | Global Commerce',
  },
  description:
    'Comprehensive multilingual e-commerce platform with AI-powered content generation and advanced knowledge base functionality',
  keywords: [
    'e-commerce',
    'multilingual',
    'AI-powered',
    'global commerce',
    'online store',
    'inventory management',
    'product management',
  ],
  authors: [
    {
      name: 'Global Commerce Team',
    },
  ],
  creator: 'Global Commerce',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://globalcommerce.com',
    title: 'Global Commerce',
    description: 'Comprehensive multilingual e-commerce platform with AI-powered features',
    siteName: 'Global Commerce',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Commerce',
    description: 'Comprehensive multilingual e-commerce platform with AI-powered features',
    creator: '@globalcommerce',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background min-h-screen font-sans antialiased`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
