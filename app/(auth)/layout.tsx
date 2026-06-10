"use client"

import { Suspense } from "react"
import { useAuth } from "@/lib/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

// useSearchParams ishlatadigan qism alohida komponentga chiqarildi
function AuthGuard({ children }: { children: React.ReactNode }) {
    const { loading, user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    const redirect = searchParams.get("redirect")

    useEffect(() => {
        if (!loading && user) {
            const safeRedirect =
                redirect && redirect.startsWith("/")
                    ? redirect
                    : "/dashboard"

            router.replace(safeRedirect)
        }
    }, [user, loading, redirect, router])

    if (loading || user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
            </div>
        )
    }

    return <>{children}</>
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
            </div>
        }>
            <AuthGuard>{children}</AuthGuard>
        </Suspense>
    )
}