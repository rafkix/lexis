'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  Headphones,
  Menu,
  Mic,
  PenLine,
  X,
  Sparkles,
} from 'lucide-react'
import { useState, useEffect, useRef, CSSProperties } from 'react'

// ─── DATA ──────────────────────────────────────────────────────

const SKILLS = [
  {
    Icon: Mic,
    label: 'Speaking',
    desc: 'AI examiner',
    href: '/practice',
    bg: 'bg-red-50',
    text: 'text-red-500',
    hoverBg: 'group-hover:bg-red-100',
  },
  {
    Icon: PenLine,
    label: 'Writing',
    desc: 'Task grader',
    href: '/practice',
    bg: 'bg-violet-50',
    text: 'text-violet-500',
    hoverBg: 'group-hover:bg-violet-100',
  },
  {
    Icon: BookOpen,
    label: 'Reading',
    desc: 'Real passages',
    href: '/practice',
    bg: 'bg-blue-50',
    text: 'text-blue-500',
    hoverBg: 'group-hover:bg-blue-100',
  },
  {
    Icon: Headphones,
    label: 'Listening',
    desc: 'Audio tests',
    href: '/practice',
    bg: 'bg-amber-50',
    text: 'text-amber-500',
    hoverBg: 'group-hover:bg-amber-100',
  },
]

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '#features' },
]

const MOBILE_NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
]

// ─── DECORATIVE BACKGROUND SHAPE ───────────────────────────────
// Fixed in viewport, appears when scrolled, never moves with scroll

function HeaderBackgroundShape({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none overflow-hidden"
      style={{
        height: '120px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s cubic-bezier(.4,0,.2,1)',
      }}
    >
      {/* Main soft glow blob — top center */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '160px',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.08) 50%, transparent 80%)',
          filter: 'blur(2px)',
        }}
      />

      {/* Left accent blob */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '-40px',
          width: '260px',
          height: '120px',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Right accent blob */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-40px',
          width: '260px',
          height: '120px',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(139,92,246,0.10) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Subtle top border glow line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40%',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(139,92,246,0.4), transparent)',
        }}
      />
    </div>
  )
}

// ─── LOGO ──────────────────────────────────────────────────────

function LexisLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 select-none group"
      aria-label="Lexis — Home"
    >
      <div
        className={`
          flex items-center justify-center rounded-xl bg-indigo-600
          shadow-md shadow-indigo-200
          transition-transform duration-300
          group-hover:-rotate-[8deg] group-hover:scale-110
          ${size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'}
        `}
      >
        <BookOpen className={size === 'sm' ? 'w-3.5 h-3.5 text-white' : 'w-4 h-4 text-white'} />
      </div>
      <span
        className={`
          font-black tracking-tight text-gray-900
          ${size === 'sm' ? 'text-xl' : 'text-2xl'}
        `}
      >
        Lexi<span className="text-indigo-600">s</span>
      </span>
    </Link>
  )
}

// ─── PRACTICE DROPDOWN ─────────────────────────────────────────

function PracticeDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 text-sm font-medium text-gray-600
                   hover:text-black transition-colors rounded-lg px-2 py-1.5
                   hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-indigo-400"
      >
        Practice
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Panel */}
      <div
        role="menu"
        className="absolute top-full left-1/2 mt-3 w-72
                   bg-white border border-gray-100 rounded-2xl shadow-xl p-2
                   origin-top"
        style={{
          opacity: open ? 1 : 0,
          transform: open
            ? 'translateX(-50%) scale(1)'
            : 'translateX(-50%) scale(0.95)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .18s ease, transform .22s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        {SKILLS.map(({ Icon, label, desc, href, bg, text, hoverBg }) => (
          <Link
            key={label}
            href={href}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                       hover:bg-gray-50 transition-colors group"
          >
            <div
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                ${bg} ${hoverBg}
                transition-transform duration-200 group-hover:scale-110
              `}
            >
              <Icon size={16} className={text} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}

        <div className="border-t border-gray-100 mt-2 pt-2">
          <Link
            href="/exam"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                       hover:bg-indigo-50 transition-colors group"
          >
            <div
              className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0
                         group-hover:bg-indigo-100 transition-colors"
            >
              <BarChart3 size={16} className="text-gray-500 group-hover:text-indigo-600 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-gray-900">Full Mock</p>
              <p className="text-xs text-gray-400 mt-0.5">Timed exam</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN HEADER ───────────────────────────────────────────────

export default function LexisHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const close = () => setMobileOpen(false)

  const stagger = (i: number): CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
    transition: `opacity .5s ${i * 70 + 150}ms cubic-bezier(.4,0,.2,1),
                 transform .5s ${i * 70 + 150}ms cubic-bezier(.4,0,.2,1)`,
  })

  return (
    <>
      {/* ════ FIXED BACKGROUND SHAPE (behind header, fixed in viewport) ════ */}
      <HeaderBackgroundShape visible={scrolled} />

      {/* ════ HEADER ════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{
          transform: mounted ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform .7s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <div
          className="pointer-events-auto w-full"
          style={{
            maxWidth: scrolled ? '880px' : '1280px',
            marginTop: scrolled ? '14px' : '0',
            background: scrolled ? 'rgba(255,255,255,0.82)' : 'transparent',
            backdropFilter: scrolled ? 'blur(20px) saturate(1.8)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.8)' : 'none',
            border: scrolled
              ? '1px solid rgba(99,102,241,0.15)'
              : '1px solid transparent',
            boxShadow: scrolled
              ? '0 4px 32px rgba(99,102,241,0.10), 0 1px 0 rgba(255,255,255,0.9) inset'
              : 'none',
            borderRadius: scrolled ? '20px' : '0',
            padding: scrolled ? '0 24px' : '0 32px',
            transition: 'all .45s cubic-bezier(.4,0,.2,1)',
          }}
        >
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <div style={stagger(-1)}>
              <LexisLogo />
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
              {NAV_LINKS.map(({ label, href }, i) => (
                <Link
                  key={label}
                  href={href}
                  style={stagger(i)}
                  className="relative text-sm font-medium text-gray-600
                             hover:text-black transition-colors group
                             focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-indigo-400 rounded-sm"
                >
                  {label}
                  <span
                    className="absolute -bottom-0.5 left-0 h-0.5 w-0 rounded-full
                               bg-indigo-500 transition-all duration-200 group-hover:w-full"
                  />
                </Link>
              ))}

              <div style={stagger(NAV_LINKS.length)}>
                <PracticeDropdown />
              </div>
            </nav>

            {/* Desktop CTA */}
            <div
              className="hidden md:flex items-center gap-2"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(20px)',
                transition: 'opacity .6s .55s, transform .6s .55s',
              }}
            >
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-gray-700 hover:text-black
                             hover:bg-gray-100 rounded-xl transition-all"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5
                             rounded-xl shadow-md shadow-indigo-200 hover:shadow-indigo-300
                             transition-all duration-200 hover:-translate-y-0.5"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="md:hidden p-2 -mr-1 rounded-xl text-gray-700
                         hover:text-black hover:bg-gray-100 transition-all
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              style={stagger(0)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ════ MOBILE OVERLAY ════ */}
      <div
        aria-hidden="true"
        onClick={close}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        style={{
          opacity: mobileOpen ? 1 : 0,
          visibility: mobileOpen ? 'visible' : 'hidden',
          transition: 'opacity .3s, visibility .3s',
        }}
      />

      {/* ════ MOBILE DRAWER ════ */}
      <aside
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        className="fixed top-0 right-0 h-full z-50
                   w-[80%] max-w-[310px]"
        style={{
          transform: mobileOpen ? 'translateX(0)' : 'translateX(110%)',
          transition: 'transform .38s cubic-bezier(.22,1,.36,1)',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '-8px 0 40px rgba(99,102,241,0.12), -1px 0 0 rgba(99,102,241,0.08)',
        }}
      >
        {/* Top indigo accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, rgba(99,102,241,0), rgba(99,102,241,0.7), rgba(139,92,246,0.5), rgba(99,102,241,0))',
          }}
        />

        <div className="flex flex-col h-full p-5 overflow-y-auto">

          {/* Top row */}
          <div className="flex items-center justify-between mb-6">
            <LexisLogo size="sm" />
            <button
              onClick={close}
              aria-label="Close menu"
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                         text-gray-500 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
            {MOBILE_NAV.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={close}
                className="text-sm font-medium text-gray-700 hover:text-indigo-600
                           px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Practice section */}
          <div>
            <div className="flex items-center gap-1.5 px-3 mb-2">
              <Sparkles size={10} className="text-indigo-400" />
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                Practice
              </p>
            </div>

            <div className="flex flex-col gap-0.5">
              {SKILLS.map(({ Icon, label, desc, href, bg, text }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                             hover:bg-gray-50 transition-colors group"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}
                                group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon size={14} className={text} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{label}</p>
                    <p className="text-[11px] text-gray-400">{desc}</p>
                  </div>
                </Link>
              ))}

              <Link
                href="/exam"
                onClick={close}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                           hover:bg-indigo-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0
                                group-hover:bg-indigo-100 transition-colors">
                  <BarChart3 size={14} className="text-gray-500 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">Full Mock</p>
                  <p className="text-[11px] text-gray-400">Timed exam</p>
                </div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-auto pt-5 space-y-2.5 border-t border-gray-100">
            <Link href="/login" onClick={close}>
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl text-sm font-medium border-gray-200
                           hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={close}>
              <Button
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700
                           text-white text-sm font-semibold shadow-md shadow-indigo-200
                           hover:shadow-indigo-300 transition-all hover:-translate-y-0.5"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}