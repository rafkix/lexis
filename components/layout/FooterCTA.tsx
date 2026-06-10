'use client'

import Link from 'next/link'
import { Mic } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white px-4 sm:px-6 lg:px-8 pt-16 pb-10">

      <div className="max-w-7xl mx-auto">

        {/* 🔥 TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-indigo-500" />
              <span className="text-xl font-bold">Lexis.uz</span>
            </div>

            <p className="text-sm text-white/70 mb-6">
              AI-powered English speaking platform for IELTS & CEFR success.
            </p>

            {/* MINI CTA */}
            <Link
              href="/practice"
              className="inline-block text-sm bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition"
            >
              Start Practicing →
            </Link>
          </div>

          {/* PRODUCT */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-2 text-sm text-white/70">

              <li>
                <Link href="#features" className="hover:text-white transition">
                  Features
                </Link>
              </li>

              <li>
                <Link href="#pricing" className="hover:text-white transition">
                  Pricing
                </Link>
              </li>

              <li>
                <Link href="/practice" className="hover:text-white transition">
                  Practice Mode
                </Link>
              </li>

              <li>
                <Link href="/tests/ielts" className="hover:text-white transition">
                  Exam Mode
                </Link>
              </li>

            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-sm text-white/70">

              <li>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>

              <li>
                <Link href="/careers" className="hover:text-white transition">
                  Careers
                </Link>
              </li>

              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>

            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-sm text-white/70">

              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>

              <li>
                <Link href="/refund" className="hover:text-white transition">
                  Refund Policy
                </Link>
              </li>

              <li>
                <Link href="/cookies" className="hover:text-white transition">
                  Cookie Settings
                </Link>
              </li>

            </ul>
          </div>

        </div>

        {/* 🔥 DIVIDER */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-sm text-white/60">
            © {currentYear} Lexis.uz. All rights reserved.
          </p>

          {/* SOCIAL / EXTRA */}
          <div className="flex gap-4 text-sm text-white/60">
            <Link href="https://t.me/lexis_uz" className="hover:text-white">Telegram</Link>
            <Link href="https://instagram.com/lexis_uz" className="hover:text-white">Instagram</Link>
            <Link href="#" className="hover:text-white">YouTube</Link>
          </div>

        </div>

      </div>
    </footer>
  )
}