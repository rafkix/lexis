'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
    fallback?: string
    label?: string
}

export function BackButton({ fallback = '/dashboard', label = 'Back' }: BackButtonProps) {
    const router = useRouter()

    const handleBack = () => {
        if (window.history.length > 1) router.back()
        else router.replace(fallback)
    }

    return (
        <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 
                 hover:bg-gray-100 px-2 py-1.5 rounded-md transition-colors group"
        >
            <ArrowLeft
                className="w-[15px] h-[15px] transition-transform duration-200 group-hover:-translate-x-1"
            />
            {label}
        </button>
    )
}