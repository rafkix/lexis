import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/lib/AuthContext'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://lexis.uz'),

  title: {
    default: 'Lexis — AI English Speaking Practice',
    template: '%s | Lexis',
  },

  description:
    'Practice IELTS & CEFR speaking with AI. Get real-time feedback, band score estimation, and unlimited speaking sessions.',

  keywords: [
    'IELTS speaking',
    'CEFR',
    'English speaking practice',
    'AI English tutor',
    'IELTS AI',
    'learn English online',
    'speaking simulator',
  ],

  authors: [{ name: 'Lexis Team', url: 'https://lexis.uz' }],
  creator: 'Lexis',
  publisher: 'Lexis',

  applicationName: 'Lexis',

  openGraph: {
    title: 'Lexis — AI English Speaking Practice',
    description:
      'Improve your IELTS speaking with AI feedback and real exam simulation.',
    url: 'https://lexis.uz',
    siteName: 'Lexis',
    images: [
      {
        url: '/og-image.png', // 👉 qo‘ygan bo‘lishing kerak
        width: 1200,
        height: 630,
        alt: 'Lexis AI Speaking Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Lexis — AI Speaking Practice',
    description:
      'Train IELTS speaking with AI. Real feedback. Real progress.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: ['/favicon.ico'],
  },

  manifest: '/site.webmanifest',

  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],

  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },

  category: 'education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background scroll-smooth">
      <body className={`${geist.className} antialiased`}>

        {/* GOOGLE */}
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        />

        <SessionProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SessionProvider>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}