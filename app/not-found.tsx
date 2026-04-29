'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'

export default function NotFoundPage() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40)
        return () => clearTimeout(t)
    }, [])

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 px-6">

            {/* 🌈 Gradient glow */}
            <div className="absolute inset-0">
                <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-400/20 blur-3xl rounded-full" />
                <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-blue-400/20 blur-3xl rounded-full" />
            </div>

            {/* 🧩 Subtle pattern */}
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:20px_20px]" />

            <div className="relative max-w-md w-full text-center">

                {/* Badge */}
                <div
                    className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full backdrop-blur-md"
                    style={{
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 0.4s ease',
                    }}
                >
                    <Search size={13} className="text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600">
                        404 • Page not found
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
                    This page disappeared
                </h1>

                <p className="mt-3 text-sm text-gray-500">
                    It might have been moved, deleted, or never existed.
                </p>

                {/* CTA */}
                <div className="mt-8 flex flex-col gap-3">
                    <Link
                        href="/"
                        className="w-full py-3 rounded-xl text-white font-medium"
                        style={{
                            background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                            boxShadow: '0 10px 30px -10px rgba(99,102,241,0.6)',
                        }}
                    >
                        Go Home
                    </Link>

                    <button
                        onClick={() => history.back()}
                        className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft size={14} />
                        Go back
                    </button>
                </div>
            </div>
        </div>
    )
}