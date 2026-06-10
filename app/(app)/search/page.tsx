'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, ArrowRight, FileText, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearch, CATEGORY_LABELS, CATEGORY_COLORS } from '@/hooks/useSearch'
import type { SearchCategory, SearchItem } from '@/hooks/useSearch'

// ─── Category filter tabs ─────────────────────────────────────────────────────

const ALL_CATEGORIES: SearchCategory[] = ['page', 'reading', 'listening', 'writing', 'speaking', 'vocab']

function CategoryTabs({
    active,
    counts,
    onChange,
}: {
    active: SearchCategory | 'all'
    counts: Partial<Record<SearchCategory, number>>
    onChange: (cat: SearchCategory | 'all') => void
}) {
    const tabs: { key: SearchCategory | 'all'; label: string }[] = [
        { key: 'all', label: 'All' },
        ...ALL_CATEGORIES.map((c) => ({ key: c as SearchCategory | 'all', label: CATEGORY_LABELS[c] })),
    ]

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {tabs.map(({ key, label }) => {
                const count = key === 'all' ? Object.values(counts).reduce((s, n) => s + (n ?? 0), 0) : counts[key as SearchCategory]
                const isActive = active === key
                if (key !== 'all' && !count) return null

                return (
                    <button
                        key={key}
                        onClick={() => onChange(key)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${isActive
                                ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
                                : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100'
                            }`}
                    >
                        {label}
                        {count !== undefined && count > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {count}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ item, focused }: { item: SearchItem; focused: boolean }) {
    return (
        <Link
            href={item.href}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all group ${focused
                    ? 'border-indigo-300 bg-indigo-50/60 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]'
                    : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/40'
                }`}
        >
            {/* Category dot */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${CATEGORY_COLORS[item.category]}`}>
                <FileText size={15} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-bold text-slate-800">{item.title}</span>
                    {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.badge === 'FREE' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                            {item.badge}
                        </span>
                    )}
                </div>
                {item.description && (
                    <p className="text-[12.5px] text-slate-400 mt-0.5 truncate">{item.description}</p>
                )}
            </div>

            <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${focused ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                }`}>
                <ArrowRight size={14} />
            </div>
        </Link>
    )
}

// ─── Grouped results ──────────────────────────────────────────────────────────

function GroupedResults({
    results,
    focusedIndex,
}: {
    results: SearchItem[]
    focusedIndex: number
}) {
    const grouped = results.reduce<Partial<Record<SearchCategory, SearchItem[]>>>(
        (acc, item) => {
            if (!acc[item.category]) acc[item.category] = []
            acc[item.category]!.push(item)
            return acc
        },
        {}
    )

    let globalIndex = 0

    return (
        <div className="space-y-6">
            {(Object.entries(grouped) as [SearchCategory, SearchItem[]][]).map(([cat, items]) => (
                <div key={cat}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${CATEGORY_COLORS[cat]}`}>
                            {CATEGORY_LABELS[cat]}
                        </span>
                        <span className="text-[11px] text-slate-400">{items.length}</span>
                    </div>
                    <div className="space-y-2">
                        {items.map((item) => {
                            const idx = globalIndex++
                            return <ResultCard key={item.id} item={item} focused={focusedIndex === idx} />
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Search size={24} className="text-slate-300" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-700 mb-1">No results found</h3>
            <p className="text-[13px] text-slate-400 max-w-xs">
                {query
                    ? <>Nothing matched <span className="font-semibold text-slate-600">"{query}"</span>. Try a different keyword.</>
                    : 'Start typing to search pages and tests.'}
            </p>
        </div>
    )
}

// ─── Search page ──────────────────────────────────────────────────────────────

export default function SearchPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialQ = searchParams.get('q') ?? ''

    const [query, setQuery] = useState(initialQ)
    const [activeCategory, setActiveCategory] = useState<SearchCategory | 'all'>('all')
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)

    const { results, loading } = useSearch(query)

    // Update the URL query string without a full navigation.
    useEffect(() => {
        const timeout = setTimeout(() => {
            const url = query.trim()
                ? `/search?q=${encodeURIComponent(query.trim())}`
                : '/search'
            window.history.replaceState(null, '', url)
        }, 300)
        return () => clearTimeout(timeout)
    }, [query])

    // Reset category filter and focus when query changes.
    useEffect(() => {
        setActiveCategory('all')
        setFocusedIndex(-1)
    }, [query])

    // Focus input on mount.
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // Filter by selected category.
    const filteredResults =
        activeCategory === 'all'
            ? results
            : results.filter((r) => r.category === activeCategory)

    // Count per category for tab badges.
    const counts = results.reduce<Partial<Record<SearchCategory, number>>>((acc, item) => {
        acc[item.category] = (acc[item.category] ?? 0) + 1
        return acc
    }, {})

    // Keyboard navigation: arrow keys + enter.
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setFocusedIndex((i) => Math.min(i + 1, filteredResults.length - 1))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setFocusedIndex((i) => Math.max(i - 1, -1))
            } else if (e.key === 'Enter' && focusedIndex >= 0) {
                const item = filteredResults[focusedIndex]
                if (item) router.push(item.href)
            } else if (e.key === 'Escape') {
                setQuery('')
                inputRef.current?.blur()
            }
        },
        [filteredResults, focusedIndex, router]
    )

    return (
        <div className="min-h-screen bg-[#f8f9fd]">
            {/* ── Header ── */}
            <div className="bg-white border-b border-[#eef1f7] px-6 py-5">
                <div className="max-w-2xl mx-auto space-y-4">
                    {/* Back + title */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500"
                        >
                            <ArrowLeft size={15} />
                        </button>
                        <h1 className="text-[15px] font-bold text-slate-800">Search</h1>
                    </div>

                    {/* Search input */}
                    <div
                        className="flex items-center gap-3 rounded-2xl px-4 bg-[#f8f9fd] border border-[#eef1f7] focus-within:border-indigo-400 transition-colors"
                        style={{ height: 52 }}
                    >
                        <Search size={17} className="text-slate-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search pages, tests, vocabulary…"
                            className="flex-1 bg-transparent outline-none text-[14.5px] text-slate-700 placeholder:text-slate-400"
                        />
                        {loading && <Loader2 size={15} className="text-indigo-400 animate-spin shrink-0" />}
                        {query && !loading && (
                            <button
                                onClick={() => setQuery('')}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                aria-label="Clear"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {/* Category filter tabs */}
                    {results.length > 0 && (
                        <CategoryTabs active={activeCategory} counts={counts} onChange={setActiveCategory} />
                    )}
                </div>
            </div>

            {/* ── Results ── */}
            <div className="max-w-2xl mx-auto px-6 py-6">
                {/* Result count */}
                {filteredResults.length > 0 && (
                    <p className="text-[12px] text-slate-400 mb-4">
                        {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                        {query && <> for <span className="font-semibold text-slate-600">"{query}"</span></>}
                    </p>
                )}

                {filteredResults.length > 0 ? (
                    <GroupedResults results={filteredResults} focusedIndex={focusedIndex} />
                ) : (
                    <EmptyState query={query} />
                )}
            </div>

            {/* Keyboard hint */}
            {filteredResults.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/90 text-white text-[11px] font-medium px-4 py-2 rounded-full backdrop-blur-sm pointer-events-none">
                    <kbd className="opacity-70">↑↓</kbd> navigate
                    <span className="opacity-40 mx-1">·</span>
                    <kbd className="opacity-70">↵</kbd> open
                    <span className="opacity-40 mx-1">·</span>
                    <kbd className="opacity-70">Esc</kbd> clear
                </div>
            )}
        </div>
    )
}