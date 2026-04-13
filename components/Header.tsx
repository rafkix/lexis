'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function LandingHeader() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* 🔥 HEADER WRAPPER */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300">

        {/* 🔥 FLOATING CONTAINER */}
        <div
          className={`
            w-full transition-all duration-300
            ${scrolled
              ? 'max-w-6xl mt-4 bg-white/90 backdrop-blur-xl border border-red-100 shadow-xl rounded-2xl px-6'
              : 'max-w-7xl bg-transparent px-4'
            }
          `}
        >
          <div className="flex items-center justify-between h-16">

            {/* 🔴 LOGO */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/header.png"
                alt="Lexis"
                width={120}
                height={40}
                priority
              />
              <span className="hidden sm:inline text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-md border border-red-200">
                IELTS • CEFR
              </span>
            </Link>

            {/* 🧠 DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-8">

              <Link href="/" className="text-sm text-gray-700 hover:text-red-600 transition">
                Home
              </Link>

              <Link href="/about" className="text-sm text-gray-700 hover:text-red-600 transition">
                About
              </Link>

              <Link href="#features" className="text-sm text-gray-700 hover:text-red-600 transition">
                Features
              </Link>

              <Link href="#how" className="text-sm text-gray-700 hover:text-red-600 transition">
                How it works
              </Link>

              <Link href="#demo" className="text-sm text-gray-700 hover:text-red-600 transition">
                Demo
              </Link>

              {/* 🔥 CTA */}
              {session ? (
                <Link href="/dashboard">
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-md">
                    Continue Practice
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>

                  <Link href="/auth/login">
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-md">
                      Start Speaking Test
                    </Button>
                  </Link>
                </>
              )}

            </div>

            {/* 📱 MOBILE BUTTON */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-red-50"
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {/* 🔥 MOBILE MENU (PREMIUM FULLSCREEN) */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col p-6">

          {/* TOP */}
          <div className="flex justify-between items-center mb-10">
            <Image src="/header.png" alt="Lexis" width={110} height={40} />
            <button onClick={() => setOpen(false)}>
              <X />
            </button>
          </div>

          {/* BADGE */}
          <div className="mb-6">
            <span className="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1 rounded-md border border-red-200">
              IELTS • CEFR Speaking Practice
            </span>
          </div>

          {/* LINKS */}
          <div className="flex flex-col gap-6 text-lg text-gray-800">

            <Link href="#features" onClick={() => setOpen(false)}>
              Features
            </Link>

            <Link href="#how" onClick={() => setOpen(false)}>
              How it works
            </Link>

            <Link href="#demo" onClick={() => setOpen(false)}>
              Demo
            </Link>

          </div>

          {/* CTA */}
          <div className="mt-auto space-y-3">

            {session ? (
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <Button className="w-full bg-red-600 text-white">
                  Continue Practice
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>

                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-red-600 text-white text-lg py-6">
                    Start Speaking Test
                  </Button>
                </Link>
              </>
            )}

          </div>
        </div>
      )}
    </>
  )
}