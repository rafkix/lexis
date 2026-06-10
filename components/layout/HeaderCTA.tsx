'use client'

import { ArrowRight, BarChart3, BookOpen, ChevronDown, Headphones, Menu, Mic, PenLine, Sparkles, X } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'

const ACCENT = '#6366f1'
const TEXT_NAV = 'rgb(99, 91, 120)'
const TEXT_DARK = 'rgb(26, 19, 40)'
const BORDER = 'rgb(224, 222, 255)'
const BG_NAV = 'rgba(250, 249, 255, 0.92)'

const NAV_LINKS = [
  { label: 'Results', href: '#results' },
  { label: 'Platform', href: '#platform' },
  { label: 'Skills', href: '#skills' },
  { label: 'Route', href: '#route' },
  { label: 'Plan', href: '#plan' },
]

const SKILLS = [
  { Icon: Mic, label: 'Speaking', desc: 'AI examiner', href: '/practice/speaking' },
  { Icon: PenLine, label: 'Writing', desc: 'Task grader', href: '/practice/writing' },
  { Icon: BookOpen, label: 'Reading', desc: 'Real passages', href: '/practice/reading' },
  { Icon: Headphones, label: 'Listening', desc: 'Audio tests', href: '/practice/listening' },
]

function PracticeDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[0.84rem] font-semibold
                   transition-colors hover:bg-indigo-50 hover:text-indigo-600
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        style={{ color: TEXT_NAV }}
      >
        Practice
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        role="menu"
        className="absolute left-1/2 top-full mt-3 w-72 rounded-2xl p-2"
        style={{
          background: 'rgb(248, 247, 255)',
          border: `1px solid ${BORDER}`,
          boxShadow: '0 8px 32px rgba(99,102,241,0.13)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.95)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .17s ease, transform .22s cubic-bezier(.34,1.56,.64,1)',
          transformOrigin: 'top center',
        }}
      >
        {SKILLS.map(({ Icon, label, desc, href }) => (
          <a
            key={label}
            href={href}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 transition-all duration-200 group-hover:bg-indigo-100 group-hover:scale-110">
              <Icon size={15} className="text-indigo-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[0.85rem] font-semibold leading-tight" style={{ color: TEXT_DARK }}>{label}</p>
              <p className="text-[11px]" style={{ color: TEXT_NAV }}>{desc}</p>
            </div>
          </a>
        ))}

        <div className="mt-2 border-t pt-2" style={{ borderColor: BORDER }}>
          <a
            href="/tests/ielts"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-indigo-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 transition-all duration-200 group-hover:bg-indigo-100 group-hover:scale-110">
              <BarChart3 size={15} className="text-indigo-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[0.85rem] font-semibold leading-tight" style={{ color: TEXT_DARK }}>Full Mock</p>
              <p className="text-[11px]" style={{ color: TEXT_NAV }}>Timed exam</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useLayoutEffect(() => { setMounted(true) }, [])

  useLayoutEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useLayoutEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const close = () => setMobileOpen(false)

  return (
    <>
      <header
        aria-label="Site header"
        className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4"
        style={{
          fontFamily: 'Manrope, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          transform: mounted ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform .65s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <div
          className="mx-auto flex h-13 max-w-7xl items-center justify-between rounded-2xl border px-4 backdrop-blur-xl sm:h-16 sm:rounded-[1.05rem] sm:px-6"
          style={{
            borderColor: BORDER,
            background: BG_NAV,
            boxShadow: '0 2px 16px rgba(99,102,241,0.08)',
          }}
        >
          <a aria-label="LEXIS home" href="/" className="flex items-center select-none">
            <img src="/images/lexis-logo.png" alt="LEXIS" className="object-contain select-none h-6 w-auto sm:h-8" draggable={false} />
          </a>

          <nav className="hidden items-center gap-7 text-[0.84rem] font-semibold md:flex" style={{ color: TEXT_NAV }} aria-label="Main navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="transition-colors hover:text-indigo-600" style={{ color: TEXT_NAV }}>
                {label}
              </a>
            ))}
            {/* <PracticeDropdown /> */}
          </nav>

          <a
            href="/onboarding"
            className="hidden md:inline-flex h-10 items-center justify-center gap-2 rounded-[0.82rem] px-4 text-[0.84rem] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:opacity-90 sm:h-11 sm:px-5"
            style={{ background: ACCENT }}
          >
            Start
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </a>

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
            className="md:hidden -mr-1 rounded-xl p-2 transition-colors hover:bg-indigo-50
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            style={{ color: TEXT_NAV }}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <div
        aria-hidden="true"
        onClick={close}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        style={{
          opacity: mobileOpen ? 1 : 0,
          visibility: mobileOpen ? 'visible' : 'hidden',
          transition: 'opacity .28s, visibility .28s',
        }}
      />

      <aside
        id="mobile-drawer"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        className="fixed right-0 top-0 z-50 flex h-full w-[78%] max-w-[290px] flex-col"
        style={{
          transform: mobileOpen ? 'translateX(0)' : 'translateX(110%)',
          transition: 'transform .36s cubic-bezier(.22,1,.36,1)',
          background: 'rgb(250, 249, 255)',
          boxShadow: '-8px 0 40px rgba(99,102,241,0.10)',
          fontFamily: 'Manrope, Geist, -apple-system, sans-serif',
        }}
      >
        <div className="flex h-full flex-col overflow-y-auto">

          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <a href="/" onClick={close} className="select-none">
              <img src="/images/lexis-logo.png" alt="LEXIS" className="object-contain h-7 w-auto" draggable={false} />
            </a>
            <button
              onClick={close}
              aria-label="Close menu"
              className="rounded-lg p-1.5 transition-colors hover:bg-indigo-50
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              style={{ color: TEXT_NAV }}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col gap-0.5 px-3" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={close}
                className="rounded-xl px-3 py-2.5 text-[0.88rem] font-semibold transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                style={{ color: TEXT_NAV }}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="mx-5 my-4 h-px" style={{ background: BORDER }} />

          <div className="px-5">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles size={10} className="text-indigo-400" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                Practice
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SKILLS.map(({ Icon, label, desc, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={close}
                  className="group flex flex-col gap-2 rounded-2xl bg-indigo-50 p-3 transition-colors hover:bg-indigo-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 transition-transform duration-200 group-hover:scale-110">
                    <Icon size={15} className="text-indigo-500" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[0.82rem] font-bold leading-tight" style={{ color: TEXT_DARK }}>{label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: TEXT_NAV }}>{desc}</p>
                  </div>
                </a>
              ))}
            </div>

            <a
              href="/tests/ielts"
              onClick={close}
              className="group mt-2 flex items-center gap-3 rounded-2xl bg-indigo-50 px-3 py-3 transition-colors hover:bg-indigo-100"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/80 transition-transform duration-200 group-hover:scale-110">
                <BarChart3 size={15} className="text-indigo-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[0.82rem] font-bold leading-tight" style={{ color: TEXT_DARK }}>Full Mock Test</p>
                <p className="text-[10px]" style={{ color: TEXT_NAV }}>Timed, realistic exam</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-indigo-400 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="mt-auto px-5 pb-6 pt-5">
            <a
              href="/onboarding"
              onClick={close}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[0.82rem] text-[0.88rem] font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
              style={{ background: ACCENT }}
            >
              Start for free
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </aside>
    </>
  )
}