import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"

import { AuthProvider } from "@/lib/AuthContext"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://lexis.uz"),

  title: {
    default: "Lexis — IELTS & CEFR Practice Tests with AI Speaking Feedback",
    template: "%s | Lexis",
  },

  description:
    "Practice IELTS Reading, Listening, and Speaking with real exam simulations. Get instant scoring and AI-powered feedback for IELTS & CEFR.",

  keywords: [
    "IELTS practice",
    "CEFR test",
    "IELTS speaking AI",
    "IELTS mock test",
    "English learning platform",
    "IELTS Uzbekistan",
    "CEFR practice online",
  ],

  authors: [{ name: "Lexis Team", url: "https://lexis.uz" }],
  creator: "Lexis",
  publisher: "Lexis",

  alternates: {
    canonical: "https://lexis.uz",
  },

  openGraph: {
    title: "Lexis — IELTS & CEFR Practice with AI Feedback",
    description:
      "Train for IELTS & CEFR with real exam formats and AI-powered speaking evaluation.",
    url: "https://lexis.uz",
    siteName: "Lexis",
    images: [
      {
        url: "/og-image.png", // public ichida bo'lishi kerak
        width: 1200,
        height: 630,
        alt: "Lexis IELTS Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Lexis — IELTS Practice Platform",
    description:
      "Practice IELTS with AI feedback and real exam simulations.",
    images: ["/og-image.png"],
    creator: "@lexis", // bo‘lmasa olib tashla
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthProvider>
          {children}
        </AuthProvider>

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}