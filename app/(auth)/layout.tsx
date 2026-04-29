"use client"

import { useAuth } from "@/lib/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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