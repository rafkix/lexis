"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
    /** Fallback route when there is no browser history */
    fallback?: string
    /** Label shown next to the arrow */
    label?: string
    /** Extra Tailwind classes */
    className?: string
}

/**
 * Unified back button used across all IELTS pages.
 * Goes back in history when possible, otherwise navigates to `fallback`.
 */
export function BackButton({
    fallback = "/",
    label = "Back",
    className = "",
}: BackButtonProps) {
    const router = useRouter()

    const handleClick = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back()
        } else {
            router.push(fallback)
        }
    }

    return (
        <button
            onClick={handleClick}
            className={`
        group inline-flex items-center gap-2
        text-[13px] font-medium text-slate-500
        hover:text-slate-900 transition-colors duration-150
        ${className}
      `}
        >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white shadow-sm group-hover:border-slate-300 group-hover:shadow transition-all duration-150">
                <ArrowLeft
                    size={13}
                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
            </span>
            {label}
        </button>
    )
}