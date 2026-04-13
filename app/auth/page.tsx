'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

import {
  GoogleSignInButton,
  TelegramSignInWidget,
} from '@/components/auth/social-auth/auth-buttons'

export default function AuthPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">

      {/* 🔥 BACKGROUND */}
      <div className="absolute inset-0">

        {/* GRID */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* DEPTH GRID */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              linear-gradient(rgba(245,74,0,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(231,0,11,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
          }}
        />

        {/* GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffedd5]/70 via-white to-[#ffe3cc]/60" />

        {/* BLOBS */}
        <div className="absolute top-[10%] left-[15%] w-[300px] h-[300px] bg-[#f54a00]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#e7000b]/20 rounded-full blur-[120px]" />
      </div>

      {/* 🔥 CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >

        <div className="p-[1px] rounded-[30px] bg-gradient-to-br from-[#f54a00]/40 via-[#e17100]/30 to-[#e7000b]/40">

          <div className="relative bg-white/80 backdrop-blur-2xl rounded-[30px] p-8 border border-white/40 shadow-[0_30px_100px_rgba(0,0,0,0.12)] overflow-hidden">

            {/* GLOW */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#f54a00]/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#e7000b]/20 blur-3xl rounded-full" />

            {/* HEADER */}
            <div className="flex flex-col items-center text-center relative z-10">

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f54a00] to-[#e7000b] text-white flex items-center justify-center font-black text-xl shadow-xl">
                LX
              </div>

              <h1 className="text-3xl font-black mt-4 text-gray-900 tracking-tight">
                Welcome to Lexis
              </h1>

              <p className="text-gray-500 text-sm mt-2 max-w-xs">
                Practice IELTS speaking with AI. No teachers. No waiting.
              </p>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 space-y-3 relative z-10">

              <div className="transition hover:scale-[1.02] active:scale-[0.98]">
                <GoogleSignInButton />
              </div>

              <div className="transition hover:scale-[1.02] active:scale-[0.98]">
                <TelegramSignInWidget />
              </div>

            </div>

            {/* TRUST */}
            <div className="mt-6 flex items-center justify-between text-xs text-gray-500 relative z-10">
              <span>🔒 Secure</span>
              <span>Used by learners worldwide</span>
            </div>

            {/* TAGS */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 text-[10px] relative z-10">
              {["IELTS", "Speaking", "Fluency", "AI Feedback"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-black/5 text-gray-600 hover:bg-[#f54a00]/10 hover:text-[#f54a00] transition"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* TERMS */}
            <p className="text-xs text-center text-gray-500 mt-6 relative z-10">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="text-[#f54a00] font-semibold underline"
              >
                Terms
              </Link>
            </p>

          </div>
        </div>
      </motion.div>
    </div>
  )
}