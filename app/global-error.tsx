// app/global-error.tsx
'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error
    reset: () => void
}) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        console.error(error)
        const t = setTimeout(() => setVisible(true), 40)
        return () => clearTimeout(t)
    }, [error])

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10 flex items-center justify-center">
            <div className="max-w-md w-full text-center">

                {/* Badge */}
                <div
                    className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full"
                    style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 0.4s ease',
                    }}
                >
                    <AlertTriangle size={13} className="text-red-500" />
                    <span className="text-xs font-medium text-red-600">
                        Something went wrong
                    </span>
                </div>

                {/* Title */}
                <h1
                    className="text-3xl font-bold text-gray-900"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(12px)',
                        transition: 'all 0.5s ease',
                    }}
                >
                    Unexpected error occurred
                </h1>

                <p className="mt-3 text-sm text-gray-500">
                    Please try again or come back later.
                </p>

                {/* Actions */}
                <div className="mt-8 flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                        style={{ background: '#ef4444' }}
                    >
                        <RotateCcw size={16} />
                        Try again
                    </button>
                </div>
            </div>
        </div>
    )
}