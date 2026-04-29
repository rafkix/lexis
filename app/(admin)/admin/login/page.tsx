"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/Adminauthcontext"
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react"

export default function AdminLoginPage() {
    const router = useRouter()
    const { login } = useAdminAuth()
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async () => {
        setError(null)
        if (!identifier.trim()) return setError("Email yoki username kiriting")
        if (!password) return setError("Parol kiriting")
        setLoading(true)
        try {
            await login(identifier.trim(), password)
            router.replace("/admin/dashboard")
        } catch (e: unknown) {
            const err = e as { message?: string }
            setError(err?.message ?? "Login yoki parol noto'g'ri")
        } finally {
            setLoading(false)
        }
        
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#080810] px-4">
            {/* grid bg */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[260px] bg-red-600/8 blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-[360px]">
                <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-2xl p-8 shadow-2xl shadow-black/60">
                    {/* Icon */}
                    <div className="flex flex-col items-center mb-7">
                        <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-5 h-5 text-red-400" />
                        </div>
                        <h1 className="text-lg font-bold text-white tracking-tight">Admin Panel</h1>
                        <p className="text-xs text-gray-600 mt-1">Boshqaruv tizimiga kirish</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-2 bg-red-500/8 border border-red-500/15 text-red-400 rounded-xl px-3.5 py-3 mb-5 text-xs">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Fields */}
                    <div className="space-y-3">
                        <input
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 outline-none focus:border-red-500/40 focus:ring-2 focus:ring-red-500/10 transition"
                            placeholder="Email yoki username"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            autoFocus
                            autoComplete="username"
                        />
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-gray-700 outline-none focus:border-red-500/40 focus:ring-2 focus:ring-red-500/10 transition"
                                placeholder="Parol"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition"
                            >
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full mt-5 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Kirилmoqda…</> : "Kirish"}
                    </button>
                </div>
                <p className="text-center text-[11px] text-gray-800 mt-4">
                    Faqat ruxsat etilgan foydalanuvchilar
                </p>
            </div>
        </div>
    )
}