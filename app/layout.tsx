import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/lib/AuthContext'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lexis — AI English Speaking Platform',
  description:
    'Practice IELTS & CEFR speaking with AI. Real-time feedback, band score, unlimited speaking.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background scroll-smooth">
      <body className={`${geist.className} antialiased`}>

        {/* GOOGLE SCRIPT */}
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        />

        {/* 🔥 AUTH STACK */}
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