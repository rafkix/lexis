"use client"

import { useState } from "react"
import {
    Bell, Send, Users, User, Loader2,
    Check, X, Info, AlertTriangle, CheckCircle2,
} from "lucide-react"

// Notifications page — extend with a real notifications API when ready.
// Currently provides a compose UI shell.

type NotifType = "info" | "warning" | "success"

const TYPE_STYLES: Record<NotifType, { icon: React.ElementType; style: string }> = {
    info: { icon: Info, style: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
    warning: { icon: AlertTriangle, style: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10" },
    success: { icon: CheckCircle2, style: "text-green-400 border-green-500/20 bg-green-500/10" },
}

const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/40 transition"

const HISTORY = [
    { id: "1", title: "System Maintenance", body: "Scheduled maintenance on Sunday 2 AM UTC.", type: "warning" as NotifType, target: "all", sent_at: "2024-06-10T14:00:00Z" },
    { id: "2", title: "New Features Released", body: "Check out the latest updates in your dashboard.", type: "info" as NotifType, target: "all", sent_at: "2024-06-08T09:00:00Z" },
    { id: "3", title: "Payment Confirmed", body: "Your subscription has been activated.", type: "success" as NotifType, target: "user_123", sent_at: "2024-06-07T12:30:00Z" },
]

export default function NotificationsPage() {
    const [form, setForm] = useState({ title: "", body: "", type: "info" as NotifType, target: "all", user_id: "" })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSend = async () => {
        if (!form.title || !form.body) return
        setSending(true)
        // TODO: connect to real notifications API
        await new Promise(r => setTimeout(r, 800))
        setSending(false)
        setSent(true)
        setTimeout(() => setSent(false), 2000)
        setForm({ title: "", body: "", type: "info", target: "all", user_id: "" })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Notifications</h1>
                <p className="text-xs text-gray-600 mt-1">Send notifications to users</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Compose */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                        <Send className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-semibold text-white">Compose Notification</span>
                    </div>
                    <div className="p-5 space-y-4">
                        {/* Type */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500">Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.entries(TYPE_STYLES) as [NotifType, typeof TYPE_STYLES[NotifType]][]).map(([key, { icon: Icon, style }]) => (
                                    <button
                                        key={key}
                                        onClick={() => setForm(f => ({ ...f, type: key }))}
                                        className={`py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${form.type === key ? style : "bg-white/[0.03] border-white/[0.07] text-gray-600 hover:text-gray-400"}`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
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
                                            ? "bg-red-500/15 border-red-500/25 text-red-400"
                                            : "bg-white/[0.03] border-white/[0.07] text-gray-600 hover:text-gray-400"
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
                                <input className={inputCls} value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} placeholder="user_xxx" />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500">Title</label>
                            <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500">Message</label>
                            <textarea className={inputCls} rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Your message…" />
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={sending || !form.title || !form.body}
                            className="w-full py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition flex items-center justify-center gap-2"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                            {sent ? "Sent!" : sending ? "Sending…" : "Send Notification"}
                        </button>
                    </div>
                </div>

                {/* History */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                        <Bell className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-semibold text-white">Recent Notifications</span>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {HISTORY.map((n) => {
                            const { icon: Icon, style } = TYPE_STYLES[n.type]
                            return (
                                <div key={n.id} className="px-5 py-4 flex items-start gap-3">
                                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${style}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                                            <span className="text-[10px] text-gray-700 shrink-0">{new Date(n.sent_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.body}</p>
                                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-gray-700">
                                            {n.target === "all" ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {n.target === "all" ? "All users" : n.target}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}