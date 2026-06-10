"use client"

import { useState } from "react"
import { adminNotificationsApi } from "@/lib/api/admin"
import {
    Bell, Send, Users, User, Loader2,
    Check, AlertTriangle, Info, CheckCircle2,
} from "lucide-react"

type NotifType = "INFO" | "WARNING" | "SUCCESS" | "ERROR" | "PAYMENT" | "SUBSCRIPTION" | "ADS" | "VIDEO"

const TYPE_STYLES: Record<NotifType, { icon: React.ElementType; style: string }> = {
    INFO: { icon: Info, style: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
    WARNING: { icon: AlertTriangle, style: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10" },
    SUCCESS: { icon: CheckCircle2, style: "text-green-400 border-green-500/20 bg-green-500/10" },
    ERROR: { icon: AlertTriangle, style: "text-red-400 border-red-500/20 bg-red-500/10" },
    PAYMENT: { icon: CheckCircle2, style: "text-purple-400 border-purple-500/20 bg-purple-500/10" },
    SUBSCRIPTION: { icon: CheckCircle2, style: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" },
    ADS: { icon: Info, style: "text-orange-400 border-orange-500/20 bg-orange-500/10" },
    VIDEO: { icon: Info, style: "text-pink-400 border-pink-500/20 bg-pink-500/10" },
}

export default function NotificationsPage() {
    const [form, setForm] = useState({ title: "", message: "", type: "INFO" as NotifType, target: "all", user_id: "" })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSend = async () => {
        if (!form.title || !form.message) return
        setSending(true)
        setError(null)
        try {
            if (form.target === "all") {
                await adminNotificationsApi.broadcast({
                    title: form.title,
                    message: form.message,
                    notification_type: form.type,
                })
            } else {
                if (!form.user_id) {
                    setError("Please enter a user ID")
                    setSending(false)
                    return
                }
                await adminNotificationsApi.send({
                    user_id: form.user_id,
                    title: form.title,
                    message: form.message,
                    notification_type: form.type,
                })
            }
            setSent(true)
            setTimeout(() => setSent(false), 2000)
            setForm({ title: "", message: "", type: "INFO", target: "all", user_id: "" })
        } catch (err: any) {
            setError(err?.message ?? "Failed to send notification")
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Notifications</h1>
                <p className="text-xs text-gray-600 mt-1">Send notifications to users</p>
            </div>

            {error && (
                <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Compose */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                        <Send className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-semibold text-white">Compose Notification</span>
                    </div>
                    <div className="p-5 space-y-4">
                        {/* Type */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500">Type</label>
                            <div className="grid grid-cols-4 gap-2">
                                {(Object.entries(TYPE_STYLES) as [NotifType, typeof TYPE_STYLES[NotifType]][]).map(([key, { icon: Icon, style }]) => (
                                    <button
                                        key={key}
                                        onClick={() => setForm(f => ({ ...f, type: key }))}
                                        className={`py-2 rounded-xl border text-[10px] font-medium flex items-center justify-center gap-1 transition ${form.type === key ? style : "bg-white/[0.03] border-white/[0.07] text-gray-600 hover:text-gray-400"}`}
                                    >
                                        <Icon className="w-3 h-3" />
                                        {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Target */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500">Target</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[{ val: "all", label: "All Users", Icon: Users }, { val: "user", label: "Specific User", Icon: User }].map(({ val, label, Icon }) => (
                                    <button
                                        key={val}
                                        onClick={() => setForm(f => ({ ...f, target: val }))}
                                        className={`py-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${form.target === val
                                            ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-400"
                                            : "bg-white/[0.03] border-white/[0.07] text-gray-600 hover:text-gray-300"
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.target === "user" && (
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-500">User ID</label>
                                <input
                                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/40 transition"
                                    value={form.user_id}
                                    onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                                    placeholder="Enter user ID"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500">Title</label>
                            <input
                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/40 transition"
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="Notification title"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500">Message</label>
                            <textarea
                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/40 transition"
                                rows={4}
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                placeholder="Your message…"
                            />
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={sending || !form.title || !form.message}
                            className="w-full py-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-sm text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40 transition flex items-center justify-center gap-2"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                            {sent ? "Sent!" : sending ? "Sending…" : "Send Notification"}
                        </button>
                    </div>
                </div>

                {/* History placeholder */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-semibold text-white">Recent Notifications</span>
                    </div>
                    <div className="p-16 text-center">
                        <Bell className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                        <p className="text-xs text-gray-600">Notification history will appear here</p>
                        <p className="text-[10px] text-gray-700 mt-1">Connect to /admin/notifications endpoint</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
