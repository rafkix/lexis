"use client"

import { useState } from "react"
import { useAdminAuth } from "@/lib/Adminauthcontext"
import {
    Settings, Shield, Bell, Palette, Lock,
    Save, Loader2, Check, Eye, EyeOff,
} from "lucide-react"

const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/40 transition"

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <Icon className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-white">{title}</span>
            </div>
            <div className="p-5">{children}</div>
        </div>
    )
}

function Toggle({ enabled, onChange, label, description }: { enabled: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm text-white">{label}</p>
                {description && <p className="text-xs text-gray-600 mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`w-10 h-5.5 rounded-full border transition-all flex items-center px-0.5 shrink-0 ${enabled ? "bg-red-500/20 border-red-500/30" : "bg-white/[0.04] border-white/10"}`}
            >
                <div className={`w-4 h-4 rounded-full transition-all ${enabled ? "bg-red-400 translate-x-5" : "bg-gray-600"}`} />
            </button>
        </div>
    )
}

export default function SettingsPage() {
    const { admin } = useAdminAuth()

    // Profile form
    const [profile, setProfile] = useState({
        full_name: admin?.full_name ?? "",
        email: admin?.email ?? "",
    })

    // Password form
    const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" })
    const [showPwd, setShowPwd] = useState(false)

    // Notifications prefs
    const [notifs, setNotifs] = useState({
        payment_alerts: true,
        subscription_alerts: true,
        system_alerts: true,
        email_digests: false,
    })

    // Security prefs
    const [security, setSecurity] = useState({
        two_factor: false,
        session_timeout: true,
    })

    const [saving, setSaving] = useState<string | null>(null)
    const [saved, setSaved] = useState<string | null>(null)

    const save = async (key: string) => {
        setSaving(key)
        // TODO: wire up real API calls per section
        await new Promise(r => setTimeout(r, 600))
        setSaving(null)
        setSaved(key)
        setTimeout(() => setSaved(null), 2000)
    }

    const SaveBtn = ({ sectionKey }: { sectionKey: string }) => (
        <button
            onClick={() => save(sectionKey)}
            disabled={saving === sectionKey}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/25 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-60 transition mt-5"
        >
            {saving === sectionKey
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : saved === sectionKey
                    ? <Check className="w-3.5 h-3.5" />
                    : <Save className="w-3.5 h-3.5" />}
            {saved === sectionKey ? "Saved!" : "Save Changes"}
        </button>
    )

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-xl font-bold text-white">Settings</h1>
                <p className="text-xs text-gray-600 mt-1">Manage your admin account and preferences</p>
            </div>

            {/* Profile */}
            <Section title="Profile" icon={Settings}>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                            <span className="text-xl font-bold text-red-400">{admin?.full_name?.[0]?.toUpperCase() ?? "A"}</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">{admin?.full_name ?? admin?.username}</p>
                            <p className="text-xs text-gray-600">{admin?.email}</p>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Full Name</label>
                        <input className={inputCls} value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Email</label>
                        <input type="email" className={inputCls} value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <SaveBtn sectionKey="profile" />
                </div>
            </Section>

            {/* Password */}
            <Section title="Password" icon={Lock}>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPwd ? "text" : "password"}
                                className={inputCls + " pr-10"}
                                value={passwords.current}
                                onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                            />
                            <button onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition">
                                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">New Password</label>
                        <input type="password" className={inputCls} value={passwords.next} onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Confirm New Password</label>
                        <input type="password" className={inputCls} value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
                        {passwords.next && passwords.confirm && passwords.next !== passwords.confirm && (
                            <p className="text-xs text-red-400">Passwords do not match</p>
                        )}
                    </div>
                    <SaveBtn sectionKey="password" />
                </div>
            </Section>

            {/* Notifications */}
            <Section title="Notifications" icon={Bell}>
                <div className="space-y-5">
                    {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(([key, val]) => (
                        <Toggle
                            key={key}
                            enabled={val}
                            onChange={(v) => setNotifs(n => ({ ...n, [key]: v }))}
                            label={key.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                        />
                    ))}
                    <SaveBtn sectionKey="notifications" />
                </div>
            </Section>

            {/* Security */}
            <Section title="Security" icon={Shield}>
                <div className="space-y-5">
                    <Toggle
                        enabled={security.two_factor}
                        onChange={(v) => setSecurity(s => ({ ...s, two_factor: v }))}
                        label="Two-Factor Authentication"
                        description="Require a second verification step when logging in"
                    />
                    <Toggle
                        enabled={security.session_timeout}
                        onChange={(v) => setSecurity(s => ({ ...s, session_timeout: v }))}
                        label="Auto Session Timeout"
                        description="Automatically log out after 30 minutes of inactivity"
                    />
                    <SaveBtn sectionKey="security" />
                </div>
            </Section>
        </div>
    )
}