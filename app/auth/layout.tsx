"use client"

import { useAuth } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { loading, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && user) {
            window.location.href =
                process.env.NEXT_PUBLIC_APP_URL || "https://app.lexis.uz"
        }
    }, [user, loading])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        )
    }

    return children
}