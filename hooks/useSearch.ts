// hooks/useSearch.ts
// Central search hook. Aggregates all searchable items from the app and
// filters them against a query string on the client side.
//
// To add a new category: add a SearchItem[] to STATIC_ITEMS or fetch from
// an API inside the hook and append to the items list.

import { useMemo, useEffect, useState } from 'react'
import { listTests } from '@/lib/api/ielts_reading'
import type { ReadingTestListOut } from '@/lib/api/ielts_reading'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SearchCategory =
    | 'page'
    | 'reading'
    | 'listening'
    | 'writing'
    | 'speaking'
    | 'vocab'

export interface SearchItem {
    id: string
    title: string
    description?: string
    category: SearchCategory
    href: string
    badge?: string       // e.g. "FREE", "PRO", "EASY"
    keywords?: string[]  // extra terms to match against
}

// ─── Static pages ─────────────────────────────────────────────────────────────
// Add every navigable page here so the search always finds them instantly.

const STATIC_ITEMS: SearchItem[] = [
    {
        id: 'page-dashboard',
        title: 'Dashboard',
        description: 'Your overview, recent activity, and stats',
        category: 'page',
        href: '/dashboard',
        keywords: ['home', 'overview', 'stats'],
    },
    {
        id: 'page-mock-exams',
        title: 'Mock Exams',
        description: 'Full-length practice tests under exam conditions',
        category: 'page',
        href: '/mock-exams',
        keywords: ['exam', 'test', 'full', 'mock'],
    },
    {
        id: 'page-practice',
        title: 'Practice',
        description: 'Skill-specific practice sessions',
        category: 'page',
        href: '/practice',
        keywords: ['exercise', 'drill'],
    },
    {
        id: 'page-vocab',
        title: 'Vocabulary',
        description: 'Word lists, flashcards and vocabulary builder',
        category: 'vocab',
        href: '/practice/vocab',
        keywords: ['words', 'flashcard', 'vocabulary', 'vocab'],
    },
    {
        id: 'page-progress',
        title: 'Progress',
        description: 'Band score trends and performance analysis',
        category: 'page',
        href: '/progress',
        keywords: ['results', 'analytics', 'band', 'score', 'history'],
    },
    {
        id: 'page-achievements',
        title: 'Achievements',
        description: 'Your badges, streaks and milestones',
        category: 'page',
        href: '/achievements',
        keywords: ['badges', 'trophy', 'milestones', 'streak'],
    },
    {
        id: 'page-settings',
        title: 'Settings',
        description: 'Account, notifications and preferences',
        category: 'page',
        href: '/settings',
        keywords: ['account', 'preferences', 'profile', 'password'],
    },
    {
        id: 'page-billing',
        title: 'Billing & Plans',
        description: 'Upgrade to Premium or PRO',
        category: 'page',
        href: '/billing',
        keywords: ['premium', 'pro', 'upgrade', 'subscription', 'plan', 'payment'],
    },
    {
        id: 'page-profile',
        title: 'Profile',
        description: 'Edit your name, avatar and personal info',
        category: 'page',
        href: '/profile',
        keywords: ['name', 'avatar', 'bio'],
    },
    // IELTS section pages
    {
        id: 'page-reading-list',
        title: 'IELTS Reading Tests',
        description: 'Browse all reading tests',
        category: 'reading',
        href: '/tests/ielts/reading',
        keywords: ['ielts', 'reading', 'passage', 'test'],
    },
]

// ─── Score a single item against a query ──────────────────────────────────────
// Returns a relevance score (higher = better match). 0 means no match.

function score(item: SearchItem, q: string): number {
    const lower = q.toLowerCase().trim()
    if (!lower) return 0

    const titleLower = item.title.toLowerCase()
    const descLower  = (item.description ?? '').toLowerCase()
    const kwLower    = (item.keywords ?? []).join(' ').toLowerCase()

    // Exact title match
    if (titleLower === lower) return 100
    // Title starts with query
    if (titleLower.startsWith(lower)) return 80
    // Title contains query
    if (titleLower.includes(lower)) return 60
    // Description contains query
    if (descLower.includes(lower)) return 40
    // Keyword match
    if (kwLower.includes(lower)) return 20

    // Partial word match across all fields
    const words = lower.split(/\s+/)
    const allText = `${titleLower} ${descLower} ${kwLower}`
    const matchCount = words.filter((w) => allText.includes(w)).length
    if (matchCount > 0) return matchCount * 10

    return 0
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseSearchReturn {
    results: SearchItem[]
    loading: boolean
    total: number
}

export function useSearch(query: string): UseSearchReturn {
    const [testItems, setTestItems] = useState<SearchItem[]>([])
    const [loading, setLoading] = useState(false)

    // Fetch reading tests once and convert them to SearchItems.
    useEffect(() => {
        let cancelled = false
        setLoading(true)
        listTests({ limit: 100 })
            .then((tests: ReadingTestListOut[]) => {
                if (cancelled) return
                setTestItems(
                    tests.map((t) => ({
                        id: `reading-${t.id}`,
                        title: t.global_title,
                        description: `Reading · ${t.total_questions} questions · ${t.time_limit_min} min`,
                        category: 'reading' as SearchCategory,
                        href: `/tests/ielts/reading/${t.id}`,
                        badge: t.is_free ? 'FREE' : 'PRO',
                        keywords: ['ielts', 'reading', 'test', 'passage', t.id],
                    }))
                )
            })
            .catch(() => { /* keep testItems empty */ })
            .finally(() => { if (!cancelled) setLoading(false) })

        return () => { cancelled = true }
    }, [])

    const allItems = useMemo(
        () => [...STATIC_ITEMS, ...testItems],
        [testItems]
    )

    const results = useMemo(() => {
        if (!query.trim()) return []
        return allItems
            .map((item) => ({ item, score: score(item, query) }))
            .filter(({ score: s }) => s > 0)
            .sort((a, b) => b.score - a.score)
            .map(({ item }) => item)
    }, [allItems, query])

    return { results, loading, total: results.length }
}

// ─── Category display helpers ─────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<SearchCategory, string> = {
    page:      'Pages',
    reading:   'Reading Tests',
    listening: 'Listening Tests',
    writing:   'Writing Tests',
    speaking:  'Speaking Tests',
    vocab:     'Vocabulary',
}

export const CATEGORY_COLORS: Record<SearchCategory, string> = {
    page:      'bg-slate-100 text-slate-600',
    reading:   'bg-blue-100 text-blue-700',
    listening: 'bg-purple-100 text-purple-700',
    writing:   'bg-emerald-100 text-emerald-700',
    speaking:  'bg-orange-100 text-orange-700',
    vocab:     'bg-pink-100 text-pink-700',
}