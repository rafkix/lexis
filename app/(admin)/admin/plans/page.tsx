"use client"

import { useEffect, useState } from "react"
import { adminPlansApi } from "@/lib/api/admin"
import type { Plan, PlanCreatePayload, PlanUpdatePayload } from "@/lib/types/admin"
import {
    Tag, Plus, Pencil, Trash2, Loader2, X, Check,
    DollarSign, Clock, Zap,
} from "lucide-react"

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl bg-[#0f0f1c] border border-white/[0.08] shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <h2 className="text-sm font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-white transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs text-gray-500">{label}</label>
            {children}
        </div>
    )
}

const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/40 focus:bg-white/[0.06] transition"

type FormState = {
    name: string
    slug: string
    description: string
    price: number
    currency: string
    interval: "monthly" | "yearly" | "weekly" | "daily"
    interval_count: number
    trial_days: number
    features: Record<string, object>
    is_active: boolean
    is_featured: boolean
    sort_order: number
}

const EMPTY_FORM: FormState = {
    name: "",
    slug: "",
    description: "",
    price: 0,
    currency: "UZS",
    interval: "monthly",
    interval_count: 1,
    trial_days: 0,
    features: {},
    is_active: true,
    is_featured: false,
    sort_order: 0,
}

// Convert features dict to editable lines: "key: value" or just "key"
function featuresToRaw(features: Record<string, object>): string {
    return Object.entries(features)
        .map(([k, v]) => {
            const str = JSON.stringify(v)
            return str === "{}" || str === "null" ? k : `${k}: ${str}`
        })
        .join("\n")
}

// Parse lines back to dict: "key: jsonValue" or just "key" → { key: {} }
function rawToFeatures(raw: string): Record<string, object> {
    return Object.fromEntries(
        raw.split("\n")
            .map(l => l.trim())
            .filter(Boolean)
            .map(line => {
                const colon = line.indexOf(": ")
                if (colon === -1) return [line, {}]
                const key = line.slice(0, colon).trim()
                try {
                    return [key, JSON.parse(line.slice(colon + 2))]
                } catch {
                    return [key, { value: line.slice(colon + 2).trim() }]
                }
            })
    )
}

// Auto-generate slug from name
function toSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<"create" | "edit" | null>(null)
    const [editing, setEditing] = useState<Plan | null>(null)
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [featuresRaw, setFeaturesRaw] = useState("")

    const load = () => {
        setLoading(true)
        adminPlansApi.getAll()
            .then(setPlans)
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setFeaturesRaw("")
        setEditing(null)
        setModal("create")
    }

    const openEdit = (plan: Plan) => {
        setEditing(plan)
        setForm({
            name: plan.name,
            slug: plan.slug ?? "",
            description: plan.description ?? "",
            price: plan.price,
            currency: plan.currency ?? "UZS",
            interval: plan.interval ?? "monthly",
            interval_count: plan.interval_count ?? 1,
            trial_days: plan.trial_days ?? 0,
            features: plan.features ?? {},
            is_active: plan.is_active,
            is_featured: plan.is_featured ?? false,
            sort_order: plan.sort_order ?? 0,
        })
        setFeaturesRaw(featuresToRaw(plan.features ?? {}))
        setModal("edit")
    }

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm(f => ({ ...f, [key]: value }))

    const handleNameChange = (name: string) => {
        setForm(f => ({
            ...f,
            name,
            // Auto-fill slug only if it hasn't been manually edited
            slug: f.slug === toSlug(f.name) || f.slug === "" ? toSlug(name) : f.slug,
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        const payload = { ...form, features: rawToFeatures(featuresRaw) }
        try {
            if (modal === "edit" && editing) {
                // PATCH only accepts a subset — omit slug
                const { slug, currency, interval, interval_count, trial_days, sort_order, ...patchable } = payload
                await adminPlansApi.update(editing.id, patchable as PlanUpdatePayload)
            } else {
                await adminPlansApi.create(payload as PlanCreatePayload)
            }
            setModal(null)
            load()
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this plan?")) return
        setDeletingId(id)
        try {
            await adminPlansApi.delete(id)
            load()
        } finally {
            setDeletingId(null)
        }
    }

    const intervalLabel = (plan: Plan) => {
        const count = plan.interval_count ?? 1
        return count === 1 ? plan.interval : `${count}× ${plan.interval}`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Plans</h1>
                    <p className="text-xs text-gray-600 mt-1">Manage subscription plans</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-medium hover:bg-red-500/20 transition"
                >
                    <Plus className="w-4 h-4" /> New Plan
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div key={plan.id} className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5 space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <Tag className="w-4 h-4 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{plan.name}</p>
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${plan.is_active ? "text-green-400 border-green-500/20 bg-green-500/10" : "text-gray-500 border-white/10 bg-white/5"}`}>
                                            {plan.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(plan)} className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.07] transition">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(plan.id)} disabled={deletingId === plan.id} className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition">
                                        {deletingId === plan.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {plan.description && <p className="text-xs text-gray-600">{plan.description}</p>}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    {(plan.price / 100).toFixed(2)} {plan.currency}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {intervalLabel(plan)}
                                </span>
                            </div>

                            {plan.features && Object.keys(plan.features).length > 0 && (
                                <ul className="space-y-1">
                                    {Object.keys(plan.features).map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                                            <Zap className="w-3 h-3 text-red-400 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {(modal === "create" || modal === "edit") && (
                <Modal title={modal === "create" ? "Create Plan" : "Edit Plan"} onClose={() => setModal(null)}>
                    <div className="space-y-4">
                        <Field label="Name">
                            <input className={inputCls} value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Pro Plan" />
                        </Field>
                        {modal === "create" && (
                            <Field label="Slug">
                                <input className={inputCls} value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="pro-plan" />
                            </Field>
                        )}
                        <Field label="Description">
                            <textarea className={inputCls} rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description…" />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Price (cents)">
                                <input type="number" className={inputCls} value={form.price} onChange={e => set("price", Number(e.target.value))} />
                            </Field>
                            <Field label="Currency">
                                <input className={inputCls} value={form.currency} onChange={e => set("currency", e.target.value)} placeholder="UZS" />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Interval">
                                <select className={inputCls} value={form.interval} onChange={e => set("interval", e.target.value as FormState["interval"])}>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </Field>
                            <Field label="Interval count">
                                <input type="number" min={1} className={inputCls} value={form.interval_count} onChange={e => set("interval_count", Number(e.target.value))} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Trial days">
                                <input type="number" min={0} className={inputCls} value={form.trial_days} onChange={e => set("trial_days", Number(e.target.value))} />
                            </Field>
                            <Field label="Sort order">
                                <input type="number" className={inputCls} value={form.sort_order} onChange={e => set("sort_order", Number(e.target.value))} />
                            </Field>
                        </div>
                        <Field label='Features (one per line, optionally "key: value")'>
                            <textarea className={inputCls} rows={4} value={featuresRaw} onChange={e => setFeaturesRaw(e.target.value)} placeholder={"Unlimited requests\nMax users: 10\nPriority support"} />
                        </Field>
                        <div className="flex gap-4">
                            <Field label="Status">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div onClick={() => set("is_active", !form.is_active)} className={`w-9 h-5 rounded-full border transition-all flex items-center px-0.5 ${form.is_active ? "bg-red-500/20 border-red-500/30" : "bg-white/[0.04] border-white/10"}`}>
                                        <div className={`w-4 h-4 rounded-full transition-all ${form.is_active ? "bg-red-400 translate-x-4" : "bg-gray-600"}`} />
                                    </div>
                                    <span className="text-xs text-gray-400">Active</span>
                                </label>
                            </Field>
                            <Field label="Featured">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div onClick={() => set("is_featured", !form.is_featured)} className={`w-9 h-5 rounded-full border transition-all flex items-center px-0.5 ${form.is_featured ? "bg-red-500/20 border-red-500/30" : "bg-white/[0.04] border-white/10"}`}>
                                        <div className={`w-4 h-4 rounded-full transition-all ${form.is_featured ? "bg-red-400 translate-x-4" : "bg-gray-600"}`} />
                                    </div>
                                    <span className="text-xs text-gray-400">Featured</span>
                                </label>
                            </Field>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-gray-500 hover:text-white transition">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-sm text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}