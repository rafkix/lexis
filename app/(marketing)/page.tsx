'use client'

import {
  BookOpen, BarChart3, Target, ArrowRight, LayoutDashboard,
  ClipboardList, PenLine, TrendingUp, Bookmark, Settings,
  Bell, Headphones, BookMarked, Mic, ShieldCheck,
  Brain, BarChart2, Smartphone, Zap, MousePointerClick,
  Star, Timer, CheckCircle2,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

/* ─── HOOKS ─────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { setInView(e.isIntersecting) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useInViewOnce(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* ─── DONUT CHART ────────────────────────────────────────────────── */
function DonutChart({ animate }: { animate: boolean }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dash = circumference * 0.75
  return (
    <svg width="70" height="70" viewBox="0 0 70 70">
      <circle cx="35" cy="35" r={radius} fill="none" stroke="#eef2ff" strokeWidth="8" />
      <circle
        cx="35" cy="35" r={radius} fill="none" stroke="#4f46e5" strokeWidth="8"
        strokeDasharray={`${animate ? dash : 0} ${circumference}`}
        strokeLinecap="round"
        strokeDashoffset={circumference * 0.25}
        style={{ transition: 'stroke-dasharray 1.2s .5s cubic-bezier(.4,0,.2,1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </svg>
  )
}

/* ─── ILLUSTRATIONS ──────────────────────────────────────────────── */
function IllustrationLimitedPractice() {
  return (
    <div className="flex items-end justify-center w-full h-[130px] sm:h-[150px] bg-[#f0f1fa] rounded-b-2xl overflow-hidden">
      <svg viewBox="0 0 200 130" width="100%" height="130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
        <rect x="20" y="95" width="160" height="8" rx="4" fill="#c7caef" />
        <rect x="55" y="75" width="90" height="22" rx="4" fill="#5b5fc7" />
        <rect x="58" y="40" width="84" height="38" rx="4" fill="#3a3f9e" />
        <rect x="62" y="44" width="76" height="30" rx="2" fill="#6366f1" opacity="0.6" />
        <line x1="90" y1="52" x2="98" y2="60" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="98" y1="52" x2="90" y2="60" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="106" y1="52" x2="114" y2="60" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="114" y1="52" x2="106" y2="60" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="82" y="68" width="36" height="28" rx="6" fill="#4F6EF7" />
        <circle cx="100" cy="55" r="14" fill="#FBBF8C" />
        <path d="M86 50 Q87 38 100 36 Q113 38 114 50 Q110 42 100 42 Q90 42 86 50Z" fill="#1a1a2e" />
        <ellipse cx="95" cy="53" rx="2" ry="2.2" fill="#1a1a2e" />
        <ellipse cx="105" cy="53" rx="2" ry="2.2" fill="#1a1a2e" />
        <path d="M92 49 Q95 47 98 49" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M102 49 Q105 47 108 49" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M95 60 Q100 57 105 60" stroke="#d4845a" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <ellipse cx="87" cy="58" rx="5" ry="4" fill="#FBBF8C" />
        <text x="30" y="55" fontSize="22" fill="#6366f1" opacity="0.7" fontWeight="bold">?</text>
        <text x="155" y="48" fontSize="16" fill="#6366f1" opacity="0.5" fontWeight="bold">?</text>
        <text x="145" y="70" fontSize="12" fill="#6366f1" opacity="0.4" fontWeight="bold">?</text>
      </svg>
    </div>
  )
}

function IllustrationNoFeedback() {
  return (
    <div className="flex items-end justify-center w-full h-[130px] sm:h-[150px] bg-[#f0f1fa] rounded-b-2xl overflow-hidden">
      <svg viewBox="0 0 200 130" width="100%" height="130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
        <rect x="50" y="10" width="100" height="110" rx="8" fill="white" stroke="#dde0f5" strokeWidth="1.5" />
        <rect x="65" y="28" width="70" height="6" rx="3" fill="#e0e3f8" />
        <rect x="65" y="42" width="55" height="6" rx="3" fill="#e0e3f8" />
        <rect x="65" y="56" width="64" height="6" rx="3" fill="#e0e3f8" />
        <rect x="65" y="70" width="50" height="6" rx="3" fill="#e0e3f8" />
        <rect x="65" y="84" width="60" height="6" rx="3" fill="#e0e3f8" />
        <circle cx="148" cy="42" r="12" fill="#ef4444" />
        <line x1="143" y1="37" x2="153" y2="47" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="153" y1="37" x2="143" y2="47" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="42" cy="70" r="10" fill="#ef4444" />
        <line x1="38" y1="66" x2="46" y2="74" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="46" y1="66" x2="38" y2="74" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M130 88 Q155 82 158 100 Q161 118 138 115 L130 122 L128 112 Q110 112 108 100 Q106 88 130 88Z" fill="#6366f1" opacity="0.15" stroke="#6366f1" strokeWidth="1" />
        <text x="130" y="106" fontSize="18" fill="#6366f1" fontWeight="bold" textAnchor="middle">?</text>
      </svg>
    </div>
  )
}

function IllustrationTrackProgress() {
  return (
    <div className="flex items-end justify-center w-full h-[130px] sm:h-[150px] bg-[#f0f1fa] rounded-b-2xl overflow-hidden">
      <svg viewBox="0 0 200 130" width="100%" height="130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
        <line x1="30" y1="20" x2="180" y2="20" stroke="#dde0f5" strokeWidth="1" />
        <line x1="30" y1="45" x2="180" y2="45" stroke="#dde0f5" strokeWidth="1" />
        <line x1="30" y1="70" x2="180" y2="70" stroke="#dde0f5" strokeWidth="1" />
        <line x1="30" y1="95" x2="180" y2="95" stroke="#dde0f5" strokeWidth="1" />
        <rect x="38" y="75" width="18" height="20" rx="3" fill="#c7caef" />
        <rect x="64" y="60" width="18" height="35" rx="3" fill="#c7caef" />
        <rect x="90" y="45" width="18" height="50" rx="3" fill="#c7caef" />
        <rect x="116" y="55" width="18" height="40" rx="3" fill="#a0a8e8" />
        <rect x="142" y="30" width="18" height="65" rx="3" fill="#5b5fc7" />
        <polyline points="47,72 73,58 99,43 125,52 151,28" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />
        <circle cx="47" cy="72" r="3" fill="#6366f1" />
        <circle cx="73" cy="58" r="3" fill="#6366f1" />
        <circle cx="99" cy="43" r="3" fill="#6366f1" />
        <circle cx="125" cy="52" r="3" fill="#6366f1" />
        <circle cx="151" cy="28" r="10" fill="#ef4444" />
        <text x="151" y="32" fontSize="12" fill="white" fontWeight="bold" textAnchor="middle">!</text>
        <line x1="28" y1="95" x2="182" y2="95" stroke="#c7caef" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

function IllustrationNoGuide() {
  return (
    <div className="flex items-end justify-center w-full h-[130px] sm:h-[150px] bg-[#f0f1fa] rounded-b-2xl overflow-hidden">
      <svg viewBox="0 0 200 130" width="100%" height="130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
        <circle cx="130" cy="35" r="20" fill="white" stroke="#dde0f5" strokeWidth="1.5" />
        <circle cx="150" cy="30" r="14" fill="white" stroke="#dde0f5" strokeWidth="1.5" />
        <circle cx="143" cy="48" r="10" fill="white" stroke="#dde0f5" strokeWidth="1.5" />
        <path d="M120 32 Q124 28 128 33 Q132 38 136 33" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M137 26 Q140 22 143 26" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M122 40 Q126 36 130 40" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="118" cy="60" r="4" fill="white" stroke="#dde0f5" strokeWidth="1" />
        <circle cx="112" cy="70" r="3" fill="white" stroke="#dde0f5" strokeWidth="1" />
        <rect x="20" y="88" width="60" height="8" rx="2" fill="#5b5fc7" />
        <rect x="23" y="80" width="54" height="10" rx="2" fill="#6366f1" />
        <rect x="26" y="72" width="48" height="10" rx="2" fill="#a0a8e8" />
        <rect x="74" y="80" width="32" height="26" rx="6" fill="#4F6EF7" />
        <circle cx="90" cy="66" r="14" fill="#FBBF8C" />
        <path d="M76 60 Q78 48 90 46 Q102 48 104 60 Q100 52 90 52 Q80 52 76 60Z" fill="#1a1a2e" />
        <ellipse cx="85" cy="64" rx="2" ry="2.2" fill="#1a1a2e" />
        <ellipse cx="95" cy="64" rx="2" ry="2.2" fill="#1a1a2e" />
        <path d="M85 72 Q90 69 95 72" stroke="#d4845a" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <ellipse cx="78" cy="68" rx="4.5" ry="4" fill="#FBBF8C" />
      </svg>
    </div>
  )
}

/* ─── SVG CHARS ──────────────────────────────────────────────────── */
function PersonSVG() {
  return (
    <svg width="56" height="72" viewBox="0 0 56 72" fill="none">
      <ellipse cx="28" cy="16" rx="13" ry="13" fill="#1a1a2e" />
      <path d="M15 20 Q14 10 18 6 Q22 2 28 2 Q34 2 38 6 Q42 10 41 20 Q38 14 28 14 Q18 14 15 20Z" fill="#1a1a2e" />
      <ellipse cx="28" cy="20" rx="11" ry="12" fill="#FBBF8C" />
      <ellipse cx="17" cy="20" rx="2.5" ry="3" fill="#FBBF8C" />
      <ellipse cx="39" cy="20" rx="2.5" ry="3" fill="#FBBF8C" />
      <ellipse cx="23" cy="19" rx="1.8" ry="2" fill="#1a1a2e" />
      <ellipse cx="33" cy="19" rx="1.8" ry="2" fill="#1a1a2e" />
      <circle cx="24" cy="18" r="0.6" fill="white" />
      <circle cx="34" cy="18" r="0.6" fill="white" />
      <path d="M23 26 Q28 30 33 26" stroke="#d4845a" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <rect x="24" y="31" width="8" height="7" rx="2" fill="#FBBF8C" />
      <path d="M6 72 Q6 50 16 46 L20 44 Q24 42 28 42 Q32 42 36 44 L40 46 Q50 50 50 72Z" fill="#4F6EF7" />
      <path d="M16 46 Q8 52 10 62 Q11 66 14 67" stroke="#4F6EF7" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M40 46 Q48 52 46 62 Q45 66 42 67" stroke="#4F6EF7" strokeWidth="9" strokeLinecap="round" fill="none" />
      <ellipse cx="13" cy="68" rx="4" ry="3.5" fill="#FBBF8C" />
      <ellipse cx="43" cy="68" rx="4" ry="3.5" fill="#FBBF8C" />
    </svg>
  )
}

function RobotSVG() {
  return (
    <svg width="52" height="64" viewBox="0 0 52 64" fill="none">
      <rect x="24" y="0" width="4" height="8" rx="2" fill="#a0a8e8" />
      <circle cx="26" cy="1" r="3" fill="#5b5fc7" />
      <rect x="8" y="8" width="36" height="28" rx="8" fill="#5b5fc7" />
      <rect x="12" y="12" width="28" height="20" rx="5" fill="#3a3f9e" />
      <circle cx="20" cy="22" r="4" fill="#00d4ff" opacity="0.9" />
      <circle cx="32" cy="22" r="4" fill="#00d4ff" opacity="0.9" />
      <circle cx="20" cy="22" r="2" fill="white" />
      <circle cx="32" cy="22" r="2" fill="white" />
      <path d="M18 29 Q26 34 34 29" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="22" y="36" width="8" height="5" rx="2" fill="#4a4fbf" />
      <rect x="6" y="41" width="40" height="23" rx="8" fill="#5b5fc7" />
      <rect x="14" y="46" width="24" height="12" rx="4" fill="#3a3f9e" />
      <circle cx="20" cy="52" r="2.5" fill="#00d4ff" opacity="0.8" />
      <circle cx="26" cy="52" r="2.5" fill="#a78bfa" opacity="0.8" />
      <circle cx="32" cy="52" r="2.5" fill="#34d399" opacity="0.8" />
      <rect x="0" y="42" width="7" height="18" rx="3.5" fill="#4a4fbf" />
      <rect x="45" y="42" width="7" height="18" rx="3.5" fill="#4a4fbf" />
      <circle cx="3.5" cy="62" r="3.5" fill="#3a3f9e" />
      <circle cx="48.5" cy="62" r="3.5" fill="#3a3f9e" />
    </svg>
  )
}

function SimulationVisual() {
  return (
    <div className="bg-[#f4f5fb] rounded-2xl p-4 flex items-end justify-between gap-2 mt-auto">
      <div className="flex items-end justify-center w-14 shrink-0"><PersonSVG /></div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-end gap-[2px] h-7">
          {[6, 12, 20, 8, 16, 6, 14, 20, 10, 8, 16, 12].map((h, i) => (
            <span key={i} className="block w-[3px] rounded-sm bg-[#5b5fc7] opacity-80" style={{ height: `${h}px` }} />
          ))}
        </div>
        <div className="flex items-end gap-[2px] h-7">
          {[4, 10, 18, 14, 8, 20, 6, 16, 10, 18, 8, 12].map((h, i) => (
            <span key={i} className="block w-[3px] rounded-sm bg-[#c7caef]" style={{ height: `${h}px` }} />
          ))}
        </div>
      </div>
      <div className="flex items-end justify-center w-14 shrink-0"><RobotSVG /></div>
    </div>
  )
}

/* ─── DATA ───────────────────────────────────────────────────────── */
const skills = [
  { label: 'Listening', value: 8.0, icon: Headphones, pct: 90 },
  { label: 'Reading', value: 7.5, icon: BookMarked, pct: 80 },
  { label: 'Writing', value: 6.5, icon: PenLine, pct: 65 },
  { label: 'Speaking', value: 7.5, icon: Mic, pct: 80 },
]

const sidebarIcons = [
  { icon: LayoutDashboard, active: true },
  { icon: ClipboardList, active: false },
  { icon: PenLine, active: false },
  { icon: TrendingUp, active: false },
  { icon: Bookmark, active: false },
]

const PROBLEMS = [
  {
    iconColor: '#6366F1',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Limited Real Practice',
    desc: 'Hard to find real IELTS-like tests and speaking practice that feels authentic.',
    Illustration: IllustrationLimitedPractice,
  },
  {
    iconColor: '#6366F1',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" /><line x1="12" y1="7" x2="12" y2="13" />
      </svg>
    ),
    title: 'No Helpful Feedback',
    desc: "Many platforms don't explain mistakes or show how to actually improve.",
    Illustration: IllustrationNoFeedback,
  },
  {
    iconColor: '#6366F1',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Hard to Track Progress',
    desc: "It's difficult to know your current level or how you're improving over time.",
    Illustration: IllustrationTrackProgress,
  },
  {
    iconColor: '#6366F1',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'No One to Guide You',
    desc: 'Preparing alone can be overwhelming without expert guidance.',
    Illustration: IllustrationNoGuide,
  },
]

const STEPS = [
  { Icon: MousePointerClick, num: '01', title: 'Choose your exam', desc: 'Select IELTS Academic, CEFR, Cambridge CAE/CPE, or CD English. Then pick the skill — Speaking, Writing, Reading, or Listening.', iconBg: 'bg-blue-50', iconCls: 'text-blue-600', numCls: 'text-blue-500' },
  { Icon: Mic, num: '02', title: 'Answer naturally', desc: 'Speak, write, or listen just like a real exam session. The AI examiner adapts to your level and maintains authentic pressure.', iconBg: 'bg-indigo-50', iconCls: 'text-indigo-600', numCls: 'text-indigo-500' },
  { Icon: BarChart3, num: '03', title: 'Get instant results', desc: 'Receive your band score, CEFR level, and a detailed breakdown of fluency, grammar, vocabulary, and pronunciation — immediately.', iconBg: 'bg-emerald-50', iconCls: 'text-emerald-600', numCls: 'text-emerald-500' },
]

const MODES = [
  { Icon: BookOpen, title: 'Practice Mode', desc: 'Build confidence step by step with unlimited topic-based sessions.', iconBg: 'bg-blue-50', iconCls: 'text-blue-600', accentBorder: 'hover:border-blue-300', features: ['Unlimited speaking practice', 'Topic-based questions (all parts)', 'Instant AI corrections', 'Progress tracking per skill'], badge: 'Mode 1', badgeCls: 'bg-blue-50 text-blue-700 border-blue-200' },
  { Icon: Zap, title: 'Real Exam Mode', desc: 'Simulate the full exam pressure with timed, scored sessions.', iconBg: 'bg-indigo-50', iconCls: 'text-indigo-600', accentBorder: 'hover:border-indigo-300', features: ['Full IELTS simulation (Parts 1, 2, 3)', 'Realistic timer & pressure settings', 'Complete band score report', 'Detailed performance breakdown'], badge: 'Mode 2', badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
]

const CAPABILITIES = [
  { Icon: Mic, label: 'Speech Recognition', iconBg: 'bg-pink-50', iconCls: 'text-pink-600' },
  { Icon: Brain, label: 'AI Scoring Engine', iconBg: 'bg-purple-50', iconCls: 'text-purple-600' },
  { Icon: BarChart3, label: 'Progress Analytics', iconBg: 'bg-emerald-50', iconCls: 'text-emerald-600' },
  { Icon: Smartphone, label: 'Mobile Optimised', iconBg: 'bg-orange-50', iconCls: 'text-orange-600' },
  { Icon: PenLine, label: 'Writing Grader', iconBg: 'bg-blue-50', iconCls: 'text-blue-600' },
  { Icon: Headphones, label: 'Listening Tests', iconBg: 'bg-amber-50', iconCls: 'text-amber-600' },
  { Icon: BookOpen, label: 'Reading Practice', iconBg: 'bg-teal-50', iconCls: 'text-teal-600' },
  { Icon: Zap, label: 'Instant Feedback', iconBg: 'bg-indigo-50', iconCls: 'text-indigo-600' },
]

const FEEDBACK_ROWS = [
  { label: 'Fluency', score: '7.5', pct: 83, warn: false },
  { label: 'Grammar', score: '6.5', pct: 72, warn: true },
  { label: 'Vocabulary', score: '7.0', pct: 78, warn: false },
  { label: 'Coherence', score: '7.5', pct: 83, warn: false },
]

const CHART_BARS = [30, 36, 28, 42, 38, 50, 65]

const TESTIMONIALS = [
  { name: 'Azizbek R.', role: 'IELTS Student', score: '5.5 → 6.5', quote: 'Oldin gapira olmasdim, endi ishonch bilan gapiryapman.' },
  { name: 'Madina T.', role: 'Student', score: '6.0 → 7.0', quote: 'Har kuni 10 daqiqa mashq qilib katta natijaga chiqdim.' },
  { name: 'Javohir S.', role: 'IELTS Candidate', score: '6.5 → 7.5', quote: "Real examdek bo'ldi. Stress yo'qoldi." },
  { name: 'Dilnoza K.', role: 'CEFR Learner', score: 'B2 → C1', quote: 'Feedback juda aniq va foydali.' },
  { name: 'Sardor M.', role: 'Student', score: '6.0 → 7.0', quote: 'Speaking uchun eng yaxshi platformalardan biri.' },
  { name: 'Bekzod A.', role: 'IELTS Student', score: '5.5 → 6.5', quote: 'Savollar juda real, examga tayyorlanish osonlashdi.' },
  { name: 'Zarina H.', role: 'Student', score: '6.5 → 7.5', quote: 'Fluency ustida ishlash uchun juda qulay.' },
  { name: 'Shohruh D.', role: 'IELTS Candidate', score: '6.0 → 7.0', quote: 'AI examiner juda real gaplashadi.' },
  { name: 'Akmal T.', role: 'CEFR Learner', score: 'B1 → B2', quote: "Endi inglizcha gapirishdan qo'rqmayman." },
  { name: 'Nigora S.', role: 'Student', score: '6.0 → 6.5', quote: "Har kuni practice qilish odat bo'lib qoldi." },
  { name: 'Azamat M.', role: 'IELTS Student', score: '7.0 → 8.0', quote: 'The feedback helped me fix my weak points fast.' },
  { name: 'Faruxx S.', role: 'CEFR Learner', score: 'B2 → C1', quote: 'Feels like a real speaking exam environment.' },
  { name: 'Usmonbek Q.', role: 'IELTS Candidate', score: '6.5 → 7.5', quote: 'Practicing daily made a huge difference.' },
  { name: 'Feruza M.', role: 'CEFR Learner', score: 'B2 → C1', quote: 'Speaking darajam ancha oshdi.' },
  { name: 'Alisher Q.', role: 'IELTS Candidate', score: '6.0 → 7.0', quote: 'Real examdan oldin aynan shu kerak edi.' },
]

const STATS = [
  { num: '120K+', label: 'Active learners' },
  { num: '4.9★', label: 'Average rating' },
  { num: '+1.5', label: 'Avg band gain' },
  { num: '92%', label: 'Pass rate improvement' },
]

const PLANS = [
  { name: 'Free', desc: 'Start with limited access', price: '0', currency: 'UZS', period: null, oldPrice: null, discount: null, cta: 'Get Started Free', highlight: false, features: ['1 full mock test', '10 practice questions', 'Basic AI feedback', 'Limited daily usage'], ctaCls: 'bg-gray-900 hover:bg-black text-white', borderCls: 'border-gray-100' },
  { name: 'Pro', desc: 'For consistent improvement', price: '9,990', currency: 'UZS', period: '/month', oldPrice: '14,990', discount: '-33%', cta: 'Upgrade to Pro', highlight: true, features: ['3 full mock tests', '30 practice questions', 'Detailed AI feedback', 'Band score analysis', 'Progress tracking'], ctaCls: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20', borderCls: 'border-indigo-300' },
  { name: 'Premium', desc: 'Maximum results & full access', price: '17,780', currency: 'UZS', period: '/month', oldPrice: '24,990', discount: '-28%', cta: 'Go Premium', highlight: false, features: ['10 full mock tests', 'Unlimited practice questions', 'Advanced AI feedback', 'Full performance reports', 'Priority processing'], ctaCls: 'bg-blue-600 hover:bg-blue-700 text-white', borderCls: 'border-gray-100' },
]

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
      {name[0]}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const router = useRouter()

  const { ref: heroRef, inView: heroVisible } = useInViewOnce(0.15)
  const { ref: dashRef, inView: dashVisible } = useInViewOnce(0.1)
  const { ref: problemsRef, inView: problemsInView } = useInView(0.05)

  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 3500)
    return () => clearInterval(id)
  }, [])
  const getItem = (offset: number) => TESTIMONIALS[(idx + offset + TESTIMONIALS.length) % TESTIMONIALS.length]

  const [timeLeft, setTimeLeft] = useState(600)
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000)
    return () => clearInterval(id)
  }, [])
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const fade = (visible: boolean, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(32px)',
    transition: `opacity .7s ${delay}ms cubic-bezier(.4,0,.2,1), transform .7s ${delay}ms cubic-bezier(.4,0,.2,1)`,
  })
  const users = [
    { name: "Ali", img: "/avatars/1.jpg" },
    { name: "Sardor", img: "/avatars/2.jpg" },
    { name: "Madina", img: "/avatars/3.jpg" },
    { name: "John", img: "/avatars/4.jpg" },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">

      {/* Global grid */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(to right,rgba(79,70,229,.025) 1px,transparent 1px),linear-gradient(to bottom,rgba(79,70,229,.025) 1px,transparent 1px)`,
        backgroundSize: '42px 42px',
      }} />
      <div className="fixed top-[-150px] left-[-100px] w-[350px] h-[350px] bg-indigo-500/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-150px] right-[-100px] w-[350px] h-[350px] bg-indigo-500/10 blur-[140px] pointer-events-none" />
      <div className="fixed top-[40%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[160px] pointer-events-none" />

      <div className="relative z-10">

        {/* ═══ HERO ════════════════════════════════════════════════ */}
        <section className="w-full min-h-screen mt-12">
          {/*
            Mobile:   single column, pt-20
            Tablet:   single column, pt-24
            Desktop:  two columns side by side, pt-28
            TV:       two columns, max-w-screen-2xl, more padding
          */}
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24
                          pt-20 sm:pt-24 lg:pt-28 pb-14 sm:pb-20
                          grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT */}
            <div ref={heroRef}>
              <div style={fade(heroVisible, 0)}>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold mb-5 sm:mb-6 border border-indigo-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  50,000+ students preparing
                </span>
              </div>

              <h1 className="text-[36px] sm:text-[44px] md:text-[50px] xl:text-[60px] 2xl:text-[72px]
                             font-extrabold leading-tight tracking-tight text-gray-900 mb-4 sm:mb-6"
                style={fade(heroVisible, 100)}>
                Practice Smarter.<br />
                <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent"
                  style={{
                    display: 'inline-block',
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? 'none' : 'translateY(20px)',
                    transition: 'opacity .8s 250ms, transform .8s 250ms cubic-bezier(.4,0,.2,1)',
                  }}>Score Higher.</span>
              </h1>

              <p className="text-base sm:text-lg 2xl:text-xl text-gray-600 max-w-xl mb-8 sm:mb-10 leading-relaxed"
                style={fade(heroVisible, 300)}>
                Experience real IELTS tests, detailed feedback, and personalized practice to help you achieve your target band.
              </p>

              {/* Feature pills — hidden on very small phones, shown sm+ */}
              <div className="hidden sm:flex flex-wrap gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-10">
                {[
                  { icon: BookOpen, title: 'Real IELTS Tests', sub: 'Academic & General', delay: 350 },
                  { icon: BarChart3, title: 'Detailed Feedback', sub: 'Improve every skill', delay: 420 },
                  { icon: Target, title: 'Track Progress', sub: 'See your growth', delay: 490 },
                ].map(({ icon: Icon, title, sub, delay }) => (
                  <div key={title} className="flex items-start gap-3" style={fade(heroVisible, delay)}>
                    <div className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors shrink-0">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{title}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4" style={fade(heroVisible, 560)}>
                <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 hover:-translate-y-0.5 group">
                  Start a Free Mock Test <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="w-full sm:w-auto bg-white hover:bg-indigo-50 text-black px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 group">
                  Explore Practice <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div
                className="flex items-center gap-3 mt-6 sm:mt-8 text-xs sm:text-sm text-gray-600"
                style={fade(heroVisible, 660)}
              >
                {/* Avatars */}
                <div className="flex -space-x-3">
                  {users.map((user, i) => (
                    <div
                      key={i}
                      className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-600"
                      style={{
                        opacity: heroVisible ? 1 : 0,
                        transform: heroVisible ? "scale(1)" : "scale(0.7)",
                        transition: `opacity .4s ${720 + i * 70}ms, transform .4s ${720 + i * 70
                          }ms cubic-bezier(.34,1.56,.64,1)`,
                      }}
                    >
                      {/* Real image (fallback to initials) */}
                      {user.img ? (
                        <img
                          src={user.img}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name.slice(0, 2).toUpperCase()
                      )}

                      {/* Online indicator */}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                  ))}

                  {/* +count */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[11px] font-medium text-gray-500">
                    +50k
                  </div>
                </div>

                {/* Text */}
                <p className="leading-tight">
                  Join{" "}
                  <span className="text-indigo-600 font-semibold">50,000+</span>{" "}
                  students improving their IELTS score
                </p>
              </div>
            </div>

            {/* RIGHT – Dashboard */}
            <div
              ref={dashRef}
              className="relative hidden lg:flex justify-end"
              style={{
                opacity: dashVisible ? 1 : 0,
                transform: dashVisible ? 'none' : 'translateX(52px) translateY(16px)',
                transition: 'opacity .9s .15s cubic-bezier(.4,0,.2,1), transform .9s .15s cubic-bezier(.4,0,.2,1)',
              }}
            >
              {/* Glow */}
              <div
                className="absolute -inset-10 rounded-3xl pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 50%, rgba(79,70,229,.14) 0%, transparent 70%)',
                  opacity: dashVisible ? 1 : 0,
                  transition: 'opacity 1.2s .4s',
                }}
              />

              {/* Main card */}
              <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex">

                {/* Sidebar */}
                <aside className="w-14 bg-gray-50 border-r border-gray-100 flex flex-col items-center py-5 gap-5 shrink-0">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-2">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>

                  {sidebarIcons.map(({ icon: Icon, active }, i) => (
                    <button
                      key={i}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${active
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'text-gray-400 hover:bg-gray-200'
                        }`}
                      style={{
                        opacity: dashVisible ? 1 : 0,
                        transform: dashVisible ? 'none' : 'translateX(-8px)',
                        transition: `opacity .4s ${300 + i * 70}ms, transform .4s ${300 + i * 70
                          }ms`,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  ))}

                  <div className="mt-auto">
                    <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:scale-110 transition-all">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </aside>

                {/* Content */}
                <div className="flex-1 p-6 min-w-0">

                  {/* Header */}
                  <div
                    className="flex items-start justify-between mb-6"
                    style={{
                      opacity: dashVisible ? 1 : 0,
                      transform: dashVisible ? 'none' : 'translateY(-10px)',
                      transition: 'opacity .5s .3s, transform .5s .3s',
                    }}
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-base">
                        Welcome back, Alisher 👋
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Let's continue your IELTS preparation.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-indigo-50 transition-colors relative">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                      </button>

                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                        A
                      </div>
                    </div>
                  </div>

                  {/* Top cards */}
                  <div className="grid grid-cols-2 gap-4 mb-4">

                    {/* Band score */}
                    <div
                      className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
                      style={{
                        opacity: dashVisible ? 1 : 0,
                        transform: dashVisible ? 'none' : 'scale(.94) translateY(10px)',
                        transition:
                          'opacity .55s .42s, transform .55s .42s cubic-bezier(.34,1.2,.64,1)',
                      }}
                    >
                      <p className="text-sm text-gray-500 mb-3">Overall Band Score</p>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-4xl font-bold text-indigo-600 leading-none">
                            7.5
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Good User</p>
                        </div>

                        <DonutChart animate={dashVisible} />
                      </div>

                      <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                        ↑ +0.5 improvement
                      </span>
                    </div>

                    {/* Skills */}
                    <div
                      className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all"
                      style={{
                        opacity: dashVisible ? 1 : 0,
                        transform: dashVisible ? 'none' : 'scale(.94) translateY(10px)',
                        transition:
                          'opacity .55s .52s, transform .55s .52s cubic-bezier(.34,1.2,.64,1)',
                      }}
                    >
                      <p className="text-sm text-gray-500 mb-3">Skill Breakdown</p>

                      <div className="space-y-3">
                        {skills.map(({ label, value, icon: Icon, pct }, i) => (
                          <div key={label} className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-500 w-16 shrink-0">
                              {label}
                            </span>

                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-2 bg-indigo-600 rounded-full"
                                style={{
                                  width: dashVisible ? `${pct}%` : '0%',
                                  transition: `width 1s ${600 + i * 120
                                    }ms cubic-bezier(.4,0,.2,1)`,
                                }}
                              />
                            </div>

                            <span className="text-xs font-medium text-gray-700 w-8 text-right shrink-0">
                              {value.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom cards */}
                  <div className="grid grid-cols-2 gap-4">

                    {/* Recent */}
                    <div
                      className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
                      style={{
                        opacity: dashVisible ? 1 : 0,
                        transform: dashVisible ? 'none' : 'translateY(12px)',
                        transition: 'opacity .5s .7s, transform .5s .7s',
                      }}
                    >
                      <p className="text-sm text-gray-500 mb-1">Recent Mock Test</p>
                      <p className="text-sm font-medium text-gray-900 leading-snug">
                        IELTS Academic Mock Test 12
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Completed on May 12, 2024
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-2xl font-bold text-indigo-600">7.5</span>
                          <span className="text-xs text-gray-400 ml-1">Overall</span>
                        </div>

                        <button className="text-xs px-3 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all">
                          Review Test
                        </button>
                      </div>
                    </div>

                    {/* Next */}
                    <div
                      className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all"
                      style={{
                        opacity: dashVisible ? 1 : 0,
                        transform: dashVisible ? 'none' : 'translateY(12px)',
                        transition: 'opacity .5s .78s, transform .5s .78s',
                      }}
                    >
                      <p className="text-sm text-gray-500 mb-1">Next Practice</p>
                      <p className="text-sm font-medium text-gray-900">
                        Writing Task 2
                      </p>
                      <p className="text-xs text-gray-400">
                        Essay Writing Practice
                      </p>

                      <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 group">
                        Start Practice
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-only mini stats strip (replaces dashboard) */}
            <div className="lg:hidden grid grid-cols-2 gap-3" style={fade(heroVisible, 500)}>
              {[
                { label: 'Active learners', val: '120K+' },
                { label: 'Average rating', val: '4.9★' },
                { label: 'Avg band gain', val: '+1.5' },
                { label: 'Pass rate improve', val: '92%' },
              ].map(({ label, val }) => (
                <div key={label} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-indigo-600">{val}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ═══ PROBLEMS ════════════════════════════════════════════ */}
        <section ref={problemsRef} className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden">
          <style>{`
            @keyframes fadeUp  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
            @keyframes scaleIn { from{opacity:0;transform:scale(0.88)}      to{opacity:1;transform:scale(1)}    }
            @keyframes badgePop{ 0%{transform:scale(.7);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
            .card-hover { transition: transform .25s ease, box-shadow .25s ease; }
            .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 48px -8px rgba(99,102,241,.15); }
          `}</style>

          <div className="max-w-6xl 2xl:max-w-screen-xl mx-auto">
            <div className="flex justify-center mb-5">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 999, padding: '6px 16px', animation: problemsInView ? 'badgePop 0.5s cubic-bezier(.34,1.56,.64,1) both' : 'none' }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                  <rect x="2" y="3" width="16" height="14" rx="3" stroke="#6366F1" strokeWidth="1.6" />
                  <circle cx="10" cy="10" r="3" stroke="#6366F1" strokeWidth="1.6" />
                  <circle cx="10" cy="10" r="1" fill="#6366F1" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#6366F1', letterSpacing: 0.3 }}>Problems</span>
              </div>
            </div>

            <div className="text-center mb-4" style={{ animation: problemsInView ? 'fadeUp 0.6s 0.1s ease both' : 'none' }}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-extrabold text-[#0F172A] leading-tight" style={{ letterSpacing: '-0.5px' }}>
                Struggling to prepare<br />for <span style={{ color: '#6366F1' }}>IELTS?</span>
              </h2>
            </div>

            <p className="text-center mx-auto mb-10 sm:mb-14 text-sm sm:text-base text-[#64748B] leading-relaxed"
              style={{ maxWidth: 480, animation: problemsInView ? 'fadeUp 0.6s 0.2s ease both' : 'none' }}>
              Most students face the same challenges. We're here to solve them with smart practice and real feedback.
            </p>

            {/*
              Mobile:  1 column
              Tablet:  2 columns
              Desktop: 4 columns
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {PROBLEMS.map(({ icon, iconColor, title, desc, Illustration }, i) => (
                <div key={i} className="card-hover" style={{
                  background: 'white', border: '1.5px solid #F1F5F9', borderRadius: 20,
                  padding: '20px 20px 0 20px', display: 'flex', flexDirection: 'column',
                  overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  animation: problemsInView ? `scaleIn 0.55s ${0.15 + i * 0.1}s ease both` : 'none',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, marginBottom: 14, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 8, lineHeight: 1.3 }}>{title}</h3>
                  <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.65, marginBottom: 16, flexGrow: 1 }}>{desc}</p>
                  <div style={{ marginLeft: -20, marginRight: -20, overflow: 'hidden' }}>
                    <Illustration />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-4 mt-10 sm:mt-14"
              style={{ animation: problemsInView ? 'fadeUp 0.6s 0.55s ease both' : 'none' }}>
              <div style={{ width: 52, height: 52, background: '#EEF2FF', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 26, height: 26 }}>
                  <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.35C17.25 23.15 21 18.25 21 13V7L12 2Z" fill="#6366F1" />
                  <polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm sm:text-base text-[#475569] leading-relaxed text-center sm:text-left" style={{ maxWidth: 360 }}>
                We built <strong style={{ color: '#0F172A' }}>IELTS Mock</strong> to solve these problems and help you achieve your target band.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ SOLUTION ════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12">
          <div className="max-w-5xl 2xl:max-w-screen-lg mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-2 bg-white border border-[#dde0f5] rounded-full px-4 py-1.5 text-sm font-semibold text-[#5b5fc7] mb-5 sm:mb-6">
                <span className="w-5 h-5 rounded-full bg-[#5b5fc7] flex items-center justify-center">
                  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" /></svg>
                </span>
                Solution
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-extrabold text-[#1a1a2e] leading-tight mb-4">
                A smarter way to<br />prepare for <span className="text-[#5b5fc7]">IELTS</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
                We combine real exam simulation, AI feedback, and progress tracking to help you improve faster and achieve your target band.
              </p>
            </div>

            {/*
              Mobile:  1 column (stacked)
              Tablet:  1 column (stacked, but slightly wider cards)
              Desktop: 3 columns
            */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl border border-[#eaecf5] p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#9ba3d6]">01</span>
                  <div className="w-11 h-11 rounded-xl bg-[#eef0fb] flex items-center justify-center"><Mic size={20} className="text-[#5b5fc7]" /></div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1a1a2e] mb-2">Real Exam Simulation</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Practice speaking and other skills in a real IELTS-like environment with AI acting as your examiner.</p>
                </div>
                <SimulationVisual />
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl border border-[#eaecf5] p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#9ba3d6]">02</span>
                  <div className="w-11 h-11 rounded-xl bg-[#eef0fb] flex items-center justify-center"><Brain size={20} className="text-[#5b5fc7]" /></div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1a1a2e] mb-2">Instant AI Feedback</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Get detailed feedback on fluency, grammar, vocabulary, and coherence right after each session.</p>
                </div>
                <div className="space-y-2.5 mt-auto">
                  {FEEDBACK_ROWS.map(({ label, score, pct, warn }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <span className="w-22 text-gray-600 font-medium shrink-0 text-xs sm:text-sm">{label}</span>
                      <div className="flex-1 h-1.5 bg-[#eef0fb] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: warn ? '#f59e0b' : '#5b5fc7' }} />
                      </div>
                      <span className="w-7 text-right font-bold text-xs shrink-0" style={{ color: warn ? '#f59e0b' : '#5b5fc7' }}>{score}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between bg-[#f4f5fb] rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">Overall Band</p>
                    <p className="text-3xl font-extrabold text-[#5b5fc7] leading-none">7.5</p>
                  </div>
                  <span className="bg-[#d1fae5] text-[#059669] text-xs font-bold px-3 py-1 rounded-full">Good Job!</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl border border-[#eaecf5] p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#9ba3d6]">03</span>
                  <div className="w-11 h-11 rounded-xl bg-[#eef0fb] flex items-center justify-center"><BarChart2 size={20} className="text-[#5b5fc7]" /></div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1a1a2e] mb-2">Track Your Progress</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Monitor your performance over time with smart analytics and personalized insights.</p>
                </div>
                <div className="bg-[#f4f5fb] rounded-2xl p-4 mt-auto">
                  <div className="flex justify-end mb-1"><span className="text-xs font-extrabold text-[#5b5fc7]">7.5</span></div>
                  <div className="flex items-end gap-1.5 h-14 sm:h-16 mb-3">
                    {CHART_BARS.map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}px`, background: i === CHART_BARS.length - 1 ? '#5b5fc7' : '#c7caef' }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-center">
                    {[{ val: '12', label: 'Tests Taken', green: false }, { val: '7.1', label: 'Avg. Band', green: false }, { val: '7.5', label: 'Best Score', green: true }].map(({ val, label, green }) => (
                      <div key={label}>
                        <p className={`text-base font-extrabold ${green ? 'text-[#059669]' : 'text-[#1a1a2e]'}`}>{val}</p>
                        <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#eaecf5] rounded-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="w-11 h-11 rounded-full bg-[#5b5fc7] flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <p className="text-sm text-gray-600 font-medium flex-1">Everything you need to prepare better, practice smarter, and score higher.</p>
              <button onClick={() => router.push('/login')} className="flex items-center gap-1.5 text-[#5b5fc7] font-bold text-sm whitespace-nowrap hover:underline">
                Start your journey today →
              </button>
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto">
            <div className="max-w-2xl mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-extrabold text-gray-900 leading-tight mb-4 sm:mb-5">
                Everything you need to<br /><span className="text-indigo-500">master every skill</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-500 font-light leading-relaxed">Built specifically for IELTS, CEFR, and Cambridge success — with real AI feedback across all four skills.</p>
            </div>

            {/* Modes: stack on mobile, side-by-side on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-8 sm:mb-12">
              {MODES.map(({ Icon, title, desc, iconBg, iconCls, accentBorder, features, badge, badgeCls }, i) => (
                <div key={i} className={`p-6 sm:p-8 rounded-2xl border border-gray-100 bg-gray-50 ${accentBorder} hover:shadow-md transition-all duration-200`}>
                  <div className="flex items-center justify-between mb-5 sm:mb-6">
                    <div className={`${iconBg} w-11 sm:w-12 h-11 sm:h-12 rounded-xl flex items-center justify-center`}><Icon size={22} className={iconCls} /></div>
                    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${badgeCls}`}>{badge}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 mb-5 sm:mb-6 leading-relaxed">{desc}</p>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-4 sm:mb-5">Advanced capabilities</p>
              {/* 2 cols on mobile, 4 on sm+, 4 on lg */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {CAPABILITIES.map(({ Icon, label, iconBg, iconCls }, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-200 transition-colors">
                    <div className={`${iconBg} w-8 sm:w-9 h-8 sm:h-9 rounded-lg flex items-center justify-center shrink-0`}><Icon size={15} className={iconCls} /></div>
                    <p className="text-xs sm:text-sm font-medium text-gray-800 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto">
            <div className="max-w-xl mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-extrabold text-gray-900 leading-tight mb-4 sm:mb-5">
                Simple process.<br /><span className="text-indigo-500">Real results.</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-500 font-light leading-relaxed">From zero to exam-ready in three straightforward steps.</p>
            </div>

            {/* 1 col mobile, 3 col md+ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {STEPS.map(({ Icon, num, title, desc, iconBg, iconCls, numCls }, i) => (
                <div key={i} className="relative p-5 sm:p-7 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
                  <p className={`absolute top-5 right-6 text-6xl sm:text-7xl font-extrabold ${numCls} opacity-[0.07] select-none`}>{num}</p>
                  <div className={`${iconBg} w-11 sm:w-12 h-11 sm:h-12 rounded-xl flex items-center justify-center mb-4 sm:mb-5`}><Icon size={22} className={iconCls} /></div>
                  <p className={`text-[11px] font-bold uppercase tracking-widest ${numCls} mb-2 sm:mb-3`}>Step {num}</p>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  {i < STEPS.length - 1 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[1px] bg-gray-200" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto">
            <div className="max-w-xl mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-extrabold text-gray-900 mb-3 sm:mb-4">
                Students are improving <span className="text-indigo-500">fast</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-500 font-light leading-relaxed">Thousands of learners have raised their band score with daily AI practice.</p>
            </div>

            {/* Stats: 2 cols mobile, 4 cols sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-16">
              {STATS.map(({ num, label }, i) => (
                <div key={i} className="text-center p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-2xl sm:text-3xl font-extrabold text-indigo-500 mb-1">{num}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Testimonial cards:
                Mobile: show only 1 card (center), no blurred side cards
                Tablet+: show 3 cards with blur effect
            */}
            <div className="hidden sm:flex items-stretch justify-center gap-4 sm:gap-5">
              {[-1, 0, 1].map((offset) => {
                const item = getItem(offset)
                const isCenter = offset === 0
                return (
                  <div key={offset} className={`flex flex-col justify-between p-5 sm:p-6 rounded-2xl border bg-white transition-all duration-500 w-[240px] sm:w-[280px] lg:w-[300px] shrink-0 ${isCenter ? 'border-indigo-200 shadow-xl shadow-indigo-500/10 scale-100 opacity-100' : 'border-gray-100 scale-95 opacity-40 blur-[1px]'}`}>
                    <div className="flex gap-1 mb-3 sm:mb-4">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className="text-indigo-500 fill-indigo-500" />)}</div>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic flex-1 mb-4 sm:mb-5">"{item.quote}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar name={item.name} />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-[11px] text-gray-400">{item.role}</p>
                        <p className="text-[11px] font-semibold text-indigo-500 mt-0.5">{item.score}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile: single card */}
            <div className="sm:hidden">
              {[0].map((offset) => {
                const item = getItem(offset)
                return (
                  <div key={offset} className="flex flex-col justify-between p-5 rounded-2xl border border-indigo-200 bg-white shadow-xl shadow-indigo-500/10">
                    <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className="text-indigo-500 fill-indigo-500" />)}</div>
                    <p className="text-sm text-gray-700 leading-relaxed italic mb-4">"{item.quote}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar name={item.name} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.role}</p>
                        <p className="text-xs font-semibold text-indigo-500 mt-0.5">{item.score}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-center gap-2 mt-6 sm:mt-8">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-indigo-500' : 'w-2 h-2 bg-gray-200'}`} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRICING ═════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12" id="pricing">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto">
            <div className="max-w-xl mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-5">
                Simple, transparent <span className="text-indigo-500">pricing</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-500 font-light leading-relaxed">Choose the plan that fits your exam preparation goals. No hidden fees.</p>
            </div>

            {/*
              Mobile:  1 column (stacked)
              Tablet:  1 column or auto, users can scroll
              Desktop: 3 columns side by side
            */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-start">
              {PLANS.map(({ name, desc, price, currency, period, oldPrice, discount, cta, highlight, features, ctaCls, borderCls }, i) => (
                <div key={i} className={`relative p-6 sm:p-8 rounded-2xl bg-white border ${borderCls} ${highlight ? 'shadow-xl ring-1 ring-indigo-300 sm:-mt-2 sm:mb-2' : ''} transition-all hover:shadow-md`}>
                  {discount && <span className="absolute top-5 left-5 text-[11px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">{discount}</span>}
                  {highlight && <span className="absolute top-5 right-5 text-[11px] font-bold bg-gray-900 text-white px-2.5 py-0.5 rounded-full">Most Popular</span>}
                  <div className={`mb-5 sm:mb-6 ${discount ? 'mt-7' : ''}`}>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{name}</h3>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                  <div className="mb-5 sm:mb-7">
                    {oldPrice && <p className="text-sm text-gray-400 line-through mb-1">{oldPrice} {currency}</p>}
                    <div className="flex items-end gap-1.5">
                      <span className={`text-3xl sm:text-4xl font-extrabold ${highlight ? 'text-indigo-500' : 'text-gray-900'}`}>{price}</span>
                      <span className="text-sm text-gray-400 mb-1">{currency}</span>
                      {period && <span className="text-sm text-gray-400 mb-1">{period}</span>}
                    </div>
                  </div>
                  <button onClick={() => router.push('/login')}
                    className={`w-full py-2.5 sm:py-3 rounded-xl text-sm font-semibold mb-5 sm:mb-7 transition-all hover:-translate-y-0.5 ${ctaCls}`}>{cta}</button>
                  <ul className="space-y-2 sm:space-y-3">
                    {features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-gray-700">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="text-center text-xs sm:text-sm text-gray-400 mt-8 sm:mt-10">Limited-time discounts for early users · No credit card required</p>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══════════════════════════════════════════ */}
        <section className="relative py-16 sm:py-20 lg:py-24 px-4 overflow-hidden">
          <div className="relative z-10 max-w-3xl 2xl:max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 mb-5 sm:mb-6 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-3 py-1.5 text-xs font-semibold">
              <Zap className="w-3 h-3" /> Limited Access
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-extrabold mb-5 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">Your Band Score Won't Improve</span>
              <br />Without Real Practice
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto">
              Most students stay stuck at Band 5–6 because they don't simulate real speaking exams. Start practicing with AI and improve faster.
            </p>
            <div className="flex items-center justify-center gap-2 text-indigo-600 font-semibold mb-6 sm:mb-8">
              <Timer className="w-4 h-4" />
              Offer ends in {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button onClick={() => router.push('/practice')} size="lg"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg shadow-xl">
                Start Improving Now
              </Button>
              <Button onClick={() => router.push('/pricing')} size="lg" variant="outline"
                className="w-full sm:w-auto border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg">
                View Pricing
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">No credit card required · Start in 10 seconds</p>
          </div>
        </section>

      </div>
    </div>
  )
}