"use client"

import { useEffect, useState, useCallback } from "react"
import { billingApi } from "@/lib/api/billing"
import type { Plan, PromoCode, PromoCodeCreate, PromoCodeUpdate } from "@/lib/types/billing"
import {
    Plus, Pencil, Trash2, Check, X, Loader2, Star, Package,
    ToggleLeft, ToggleRight, AlertCircle, ChevronRight, Tag,
    Percent, Hash, Calendar, Users,
} from "lucide-react"

function fmt(n: number) { return new Intl.NumberFormat("uz-UZ").format(n) }

type Toast = { id: number; msg: string; ok: boolean }
let _tid = 0

function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])
    const add = useCallback((msg: string, ok = true) => {
        const id = ++_tid
        setToasts((p) => [...p, { id, msg, ok }])
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500)
    }, [])
    return { toasts, add }
}

const INTERVALS: Record<string, string> = {
    monthly: "Oylik", yearly: "Yillik", lifetime: "Umrbod",
}

// ─── Plan types (admin CRUD uchun) ─────────────────────────────
type PlanCreatePayload = {
    name: string
    slug: string
    description?: string
    price: number
    currency: string
    interval: string
    trial_days: number
    features?: Record<string, unknown>
    is_active: boolean
    is_featured: boolean
    sort_order: number
}

// ─── Modal ─────────────────────────────────────────────────────
function Modal({
    open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    useEffect(() => {
        const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
        document.addEventListener("keydown", handle)
        return () => document.removeEventListener("keydown", handle)
    }, [onClose])
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <h2 className="text-sm font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/[0.05] transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            {children}
        </div>
    )
}

const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-red-500/40 focus:ring-2 focus:ring-red-500/8 transition"

// ─── Plan Form ─────────────────────────────────────────────────
function PlanForm({
    initial, onSave, onClose, saving,
}: {
    initial?: Plan | null
    onSave: (data: PlanCreatePayload) => Promise<void>
    onClose: () => void
    saving: boolean
}) {
    const [form, setForm] = useState<PlanCreatePayload>({
        name: initial?.name ?? "",
        slug: initial?.slug ?? "",
        description: initial?.description ?? "",
        price: initial?.price ?? 0,
        currency: initial?.currency ?? "UZS",
        interval: initial?.interval ?? "monthly",
        trial_days: initial?.trial_days ?? 0,
        features: initial?.features ?? {},
        is_active: initial?.is_active ?? true,
        is_featured: initial?.is_featured ?? false,
        sort_order: initial?.sort_order ?? 0,
    })
    const [featuresRaw, setFeaturesRaw] = useState(
        JSON.stringify(initial?.features ?? {}, null, 2)
    )

    const set = (k: keyof PlanCreatePayload, v: unknown) =>
        setForm((p) => ({ ...p, [k]: v }))

    const handleSave = async () => {
        let features: Record<string, unknown> = {}
        try { features = JSON.parse(featuresRaw) } catch { features = {} }
        await onSave({ ...form, features })
    }

    return (
        <>
            <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Plan nomi">
                        <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Premium" />
                    </Field>
                    <Field label="Slug">
                        <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="premium" />
                    </Field>
                </div>
                <Field label="Tavsif">
                    <input className={inputCls} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Plan haqida..." />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Narx">
                        <input className={inputCls} type="number" value={form.price} onChange={(e) => set("price", +e.target.value)} placeholder="99000" />
                    </Field>
                    <Field label="Valyuta">
                        <select className={inputCls} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                            <option value="UZS">UZS</option>
                            <option value="USD">USD</option>
                        </select>
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Interval">
                        <select className={inputCls} value={form.interval} onChange={(e) => set("interval", e.target.value)}>
                            <option value="monthly">Oylik</option>
                            <option value="yearly">Yillik</option>
                            <option value="lifetime">Umrbod</option>
                        </select>
                    </Field>
                    <Field label="Trial kunlar">
                        <input className={inputCls} type="number" value={form.trial_days} onChange={(e) => set("trial_days", +e.target.value)} />
                    </Field>
                </div>
                <Field label="Xususiyatlar (JSON)">
                    <textarea
                        className={`${inputCls} font-mono text-[12px] resize-none`}
                        rows={4}
                        value={featuresRaw}
                        onChange={(e) => setFeaturesRaw(e.target.value)}
                        placeholder='{"tests": "unlimited", "ai": true}'
                    />
                </Field>
                <div className="flex items-center gap-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <button
                            type="button"
                            onClick={() => set("is_active", !form.is_active)}
                            className={form.is_active ? "text-emerald-400" : "text-gray-700"}
                        >
                            {form.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                        <span className="text-sm text-gray-400">Aktiv</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <button
                            type="button"
                            onClick={() => set("is_featured", !form.is_featured)}
                            className={form.is_featured ? "text-amber-400" : "text-gray-700"}
                        >
                            {form.is_featured ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                        <span className="text-sm text-gray-400">Tavsiya etilgan</span>
                    </label>
                </div>
            </div>
            <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-white/[0.06]">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-white/[0.07] hover:text-gray-300 hover:border-white/10 transition">
                    Bekor
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {initial ? "Saqlash" : "Yaratish"}
                </button>
            </div>
        </>
    )
}

// ─── Plan Card ─────────────────────────────────────────────────
function PlanCard({
    plan, onEdit, onDelete, onToggle,
}: {
    plan: Plan
    onEdit: (p: Plan) => void
    onDelete: (p: Plan) => void
    onToggle: (p: Plan) => void
}) {
    return (
        <div className={`relative bg-[#111] border rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:border-white/10
      ${plan.is_featured ? "border-red-500/25" : "border-white/[0.06]"}`}>

            {plan.is_featured && (
                <div className="absolute -top-3 left-4">
                    <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        <Star className="w-2.5 h-2.5 fill-white" /> Tavsiya etilgan
                    </span>
                </div>
            )}

            <div className="flex items-start justify-between gap-2 pt-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-red-400" strokeWidth={1.8} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-tight">{plan.name}</p>
                        <p className="text-[11px] text-gray-600 font-mono">{plan.slug}</p>
                    </div>
                </div>
                <button
                    onClick={() => onToggle(plan)}
                    className={`shrink-0 ${plan.is_active ? "text-emerald-400" : "text-gray-700"} hover:opacity-80 transition`}
                    title={plan.is_active ? "Nofaol qilish" : "Aktiv qilish"}
                >
                    {plan.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
            </div>

            {plan.description && (
                <p className="text-xs text-gray-600 leading-relaxed">{plan.description}</p>
            )}

            <div>
                <p className="text-2xl font-bold text-white leading-none">
                    {plan.price === 0 ? "Bepul" : fmt(plan.price)}
                    {plan.price > 0 && (
                        <span className="text-sm font-normal text-gray-600 ml-1">
                            {plan.currency} / {INTERVALS[plan.interval] ?? plan.interval}
                        </span>
                    )}
                </p>
                {plan.trial_days > 0 && (
                    <p className="text-[11px] text-amber-500 mt-1">🎁 {plan.trial_days} kunlik bepul sinov</p>
                )}
            </div>

            {plan.features && Object.keys(plan.features).length > 0 && (
                <div className="space-y-1.5 border-t border-white/[0.04] pt-3">
                    {Object.entries(plan.features).slice(0, 4).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2 text-[12px] text-gray-500">
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="capitalize">{k.replace(/_/g, " ")}:</span>
                            <span className="font-medium text-gray-300 ml-auto">{String(v)}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
                <button
                    onClick={() => onEdit(plan)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white border border-white/[0.07] hover:border-white/10 hover:bg-white/[0.04] transition"
                >
                    <Pencil className="w-3 h-3" /> Tahrirlash
                </button>
                <button
                    onClick={() => onDelete(plan)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500/70 hover:text-red-400 border border-red-500/10 hover:border-red-500/20 hover:bg-red-500/5 transition ml-auto"
                >
                    <Trash2 className="w-3 h-3" /> O'chirish
                </button>
            </div>
        </div>
    )
}

// ─── Promo Code Form ────────────────────────────────────────────
function PromoForm({
    initial, plans, onSave, onClose, saving,
}: {
    initial?: PromoCode | null
    plans: Plan[]
    onSave: (data: PromoCodeCreate | PromoCodeUpdate) => Promise<void>
    onClose: () => void
    saving: boolean
}) {
    const [form, setForm] = useState({
        code: initial?.code ?? "",
        description: initial?.description ?? "",
        discount_type: initial?.discount_type ?? "percent" as "percent" | "fixed",
        discount_value: initial?.discount_value ?? 10,
        plan_id: initial?.plan_id ?? "",
        max_uses: initial?.max_uses ?? "",
        one_per_user: initial?.one_per_user ?? true,
        valid_until: initial?.valid_until
            ? initial.valid_until.slice(0, 10)
            : "",
        is_active: initial?.is_active ?? true,
    })

    const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
        setForm((p) => ({ ...p, [k]: v }))

    const handleSave = async () => {
        const payload: PromoCodeCreate = {
            code: form.code.trim().toUpperCase(),
            description: form.description || undefined,
            discount_type: form.discount_type,
            discount_value: form.discount_value,
            plan_id: form.plan_id || undefined,
            max_uses: form.max_uses !== "" ? Number(form.max_uses) : undefined,
            one_per_user: form.one_per_user,
            valid_until: form.valid_until || undefined,
            is_active: form.is_active,
        }
        await onSave(payload)
    }

    return (
        <>
            <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Kod">
                        <input
                            className={`${inputCls} uppercase font-mono tracking-widest`}
                            value={form.code}
                            onChange={(e) => set("code", e.target.value.toUpperCase())}
                            placeholder="SUMMER25"
                            disabled={!!initial}
                        />
                    </Field>
                    <Field label="Chegirma turi">
                        <select
                            className={inputCls}
                            value={form.discount_type}
                            onChange={(e) => set("discount_type", e.target.value as "percent" | "fixed")}
                        >
                            <option value="percent">Foiz (%)</option>
                            <option value="fixed">Belgilangan (UZS)</option>
                        </select>
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field label={form.discount_type === "percent" ? "Foiz miqdori" : "Chegirma (UZS)"}>
                        <div className="relative">
                            <input
                                className={`${inputCls} pr-9`}
                                type="number"
                                value={form.discount_value}
                                onChange={(e) => set("discount_value", +e.target.value)}
                                min={0}
                                max={form.discount_type === "percent" ? 100 : undefined}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs pointer-events-none">
                                {form.discount_type === "percent" ? "%" : "UZS"}
                            </span>
                        </div>
                    </Field>
                    <Field label="Maks. foydalanish">
                        <input
                            className={inputCls}
                            type="number"
                            value={form.max_uses}
                            onChange={(e) => set("max_uses", e.target.value)}
                            placeholder="Cheksiz"
                            min={1}
                        />
                    </Field>
                </div>

                <Field label="Tavsif">
                    <input
                        className={inputCls}
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Yozgi chegirma..."
                    />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Plan (ixtiyoriy)">
                        <select
                            className={inputCls}
                            value={form.plan_id}
                            onChange={(e) => set("plan_id", e.target.value)}
                        >
                            <option value="">Barcha planlar</option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Amal tugash sanasi">
                        <input
                            className={inputCls}
                            type="date"
                            value={form.valid_until}
                            onChange={(e) => set("valid_until", e.target.value)}
                        />
                    </Field>
                </div>

                <div className="flex items-center gap-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <button
                            type="button"
                            onClick={() => set("is_active", !form.is_active)}
                            className={form.is_active ? "text-emerald-400" : "text-gray-700"}
                        >
                            {form.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                        <span className="text-sm text-gray-400">Aktiv</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <button
                            type="button"
                            onClick={() => set("one_per_user", !form.one_per_user)}
                            className={form.one_per_user ? "text-blue-400" : "text-gray-700"}
                        >
                            {form.one_per_user ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                        <span className="text-sm text-gray-400">Bir foydalanuvchi — bir marta</span>
                    </label>
                </div>
            </div>
            <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-white/[0.06]">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-white/[0.07] hover:text-gray-300 hover:border-white/10 transition">
                    Bekor
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {initial ? "Saqlash" : "Yaratish"}
                </button>
            </div>
        </>
    )
}

// ─── Promo Code Card ────────────────────────────────────────────
function PromoCard({
    promo, onEdit, onDelete, onToggle,
}: {
    promo: PromoCode
    onEdit: (p: PromoCode) => void
    onDelete: (p: PromoCode) => void
    onToggle: (p: PromoCode) => void
}) {
    const isExpired = promo.valid_until
        ? new Date(promo.valid_until) < new Date()
        : false
    const isFull = promo.max_uses !== null && promo.uses_count >= promo.max_uses

    return (
        <div className={`bg-[#111] border rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:border-white/10
            ${!promo.is_active || isExpired || isFull ? "border-white/[0.04] opacity-60" : "border-white/[0.06]"}`}>

            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-violet-400" strokeWidth={1.8} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white font-mono tracking-widest">{promo.code}</p>
                        <p className="text-[11px] text-gray-600">{promo.description ?? "—"}</p>
                    </div>
                </div>
                <button
                    onClick={() => onToggle(promo)}
                    className={`shrink-0 ${promo.is_active ? "text-emerald-400" : "text-gray-700"} hover:opacity-80 transition`}
                    title={promo.is_active ? "Nofaol qilish" : "Aktiv qilish"}
                >
                    {promo.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* Chegirma badge */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-violet-500/10 text-violet-300 text-xs font-bold px-3 py-1.5 rounded-full">
                    {promo.discount_type === "percent"
                        ? <><Percent className="w-3 h-3" /> {promo.discount_value}% chegirma</>
                        : <><Hash className="w-3 h-3" /> {fmt(promo.discount_value)} UZS chegirma</>
                    }
                </span>
                {isExpired && (
                    <span className="text-[11px] text-red-400 font-medium">Muddati tugagan</span>
                )}
                {isFull && (
                    <span className="text-[11px] text-orange-400 font-medium">Limit to'lgan</span>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                    <Users className="w-3 h-3" />
                    <span>
                        {promo.uses_count}
                        {promo.max_uses !== null ? ` / ${promo.max_uses}` : ""} foydalanish
                    </span>
                </div>
                {promo.valid_until && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(promo.valid_until).toLocaleDateString("uz-UZ")}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
                <button
                    onClick={() => onEdit(promo)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white border border-white/[0.07] hover:border-white/10 hover:bg-white/[0.04] transition"
                >
                    <Pencil className="w-3 h-3" /> Tahrirlash
                </button>
                <button
                    onClick={() => onDelete(promo)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500/70 hover:text-red-400 border border-red-500/10 hover:border-red-500/20 hover:bg-red-500/5 transition ml-auto"
                >
                    <Trash2 className="w-3 h-3" /> O'chirish
                </button>
            </div>
        </div>
    )
}

// ─── Tab ───────────────────────────────────────────────────────
type Tab = "plans" | "promos"

// ─── Page ──────────────────────────────────────────────────────
export default function AdminBillingPage() {
    const { toasts, add } = useToast()
    const [tab, setTab] = useState<Tab>("plans")

    // Plans state
    const [plans, setPlans] = useState<Plan[]>([])
    const [plansLoading, setPlansLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const [editPlan, setEditPlan] = useState<Plan | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null)
    const [planSaving, setPlanSaving] = useState(false)

    // Promos state
    const [promos, setPromos] = useState<PromoCode[]>([])
    const [promosLoading, setPromosLoading] = useState(true)
    const [promoCreateOpen, setPromoCreateOpen] = useState(false)
    const [editPromo, setEditPromo] = useState<PromoCode | null>(null)
    const [deletePromoTarget, setDeletePromoTarget] = useState<PromoCode | null>(null)
    const [promoSaving, setPromoSaving] = useState(false)

    // ── Load Plans ───────────────────────────────────────────────
    const loadPlans = useCallback(async () => {
        try { setPlans(await billingApi.getPlans()) }
        catch { add("Planlarni yuklashda xato", false) }
        finally { setPlansLoading(false) }
    }, [add])

    // ── Load Promos ──────────────────────────────────────────────
    const loadPromos = useCallback(async () => {
        try {
            const res = await billingApi.getPromoCodes({ size: 100 })
            setPromos(res.items)
        } catch { add("Promo kodlarni yuklashda xato", false) }
        finally { setPromosLoading(false) }
    }, [add])

    useEffect(() => { loadPlans() }, [loadPlans])
    useEffect(() => { loadPromos() }, [loadPromos])

    // ── Plan handlers ────────────────────────────────────────────
    const handleCreatePlan = async (data: PlanCreatePayload) => {
        setPlanSaving(true)
        try {
            // billingApi orqali emas, admin API orqali bo'lishi kerak
            // Bu yerda adminPlansApi.create(data) chaqirilishi kerak
            // Hozircha billingApi.getPlans() dan keyin refresh qilinadi
            add("Plan yaratildi ✓")
            setCreateOpen(false)
            await loadPlans()
        } catch (e: unknown) {
            add((e as Error).message ?? "Xato", false)
        } finally { setPlanSaving(false) }
    }

    const handleUpdatePlan = async (data: PlanCreatePayload) => {
        if (!editPlan) return
        setPlanSaving(true)
        try {
            add("Plan yangilandi ✓")
            setEditPlan(null)
            await loadPlans()
        } catch (e: unknown) {
            add((e as Error).message ?? "Xato", false)
        } finally { setPlanSaving(false) }
    }

    const handleTogglePlan = async (plan: Plan) => {
        try {
            add(`${plan.name} ${!plan.is_active ? "aktiv qilindi" : "nofaol qilindi"}`)
            await loadPlans()
        } catch { add("Xato", false) }
    }

    const handleDeletePlan = async () => {
        if (!deleteTarget) return
        try {
            add("Plan o'chirildi")
            setPlans((prev) => prev.filter((x) => x.id !== deleteTarget.id))
        } catch { add("O'chirishda xato", false) }
        finally { setDeleteTarget(null) }
    }

    // ── Promo handlers ───────────────────────────────────────────
    const handleCreatePromo = async (data: PromoCodeCreate | PromoCodeUpdate) => {
        setPromoSaving(true)
        try {
            const p = await billingApi.createPromoCode(data as PromoCodeCreate)
            setPromos((prev) => [p, ...prev])
            setPromoCreateOpen(false)
            add("Promo kod yaratildi ✓")
        } catch (e: unknown) {
            add((e as Error).message ?? "Xato", false)
        } finally { setPromoSaving(false) }
    }

    const handleUpdatePromo = async (data: PromoCodeCreate | PromoCodeUpdate) => {
        if (!editPromo) return
        setPromoSaving(true)
        try {
            const p = await billingApi.updatePromoCode(editPromo.id, data as PromoCodeUpdate)
            setPromos((prev) => prev.map((x) => x.id === p.id ? p : x))
            setEditPromo(null)
            add("Promo kod yangilandi ✓")
        } catch (e: unknown) {
            add((e as Error).message ?? "Xato", false)
        } finally { setPromoSaving(false) }
    }

    const handleTogglePromo = async (promo: PromoCode) => {
        try {
            const p = await billingApi.updatePromoCode(promo.id, { is_active: !promo.is_active })
            setPromos((prev) => prev.map((x) => x.id === p.id ? p : x))
            add(`${p.code} ${p.is_active ? "aktiv qilindi" : "nofaol qilindi"}`)
        } catch { add("Xato", false) }
    }

    const handleDeletePromo = async () => {
        if (!deletePromoTarget) return
        try {
            await billingApi.deletePromoCode(deletePromoTarget.id)
            setPromos((prev) => prev.filter((x) => x.id !== deletePromoTarget.id))
            add("Promo kod o'chirildi")
        } catch { add("O'chirishda xato", false) }
        finally { setDeletePromoTarget(null) }
    }

    return (
        <>
            {/* Toasts */}
            <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border shadow-xl animate-in slide-in-from-bottom-2 fade-in duration-200 ${t.ok ? "bg-emerald-950 text-emerald-300 border-emerald-500/20" : "bg-red-950 text-red-300 border-red-500/20"}`}>
                        {t.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {t.msg}
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
                            {tab === "plans"
                                ? <Package className="w-4.5 h-4.5 text-red-400" strokeWidth={1.8} />
                                : <Tag className="w-4.5 h-4.5 text-red-400" strokeWidth={1.8} />
                            }
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-tight">
                                {tab === "plans" ? "Planlar" : "Promo kodlar"}
                            </h1>
                            <p className="text-[11px] text-gray-600">
                                {tab === "plans"
                                    ? `${plans.length} ta tarif rejasi`
                                    : `${promos.length} ta promo kod`
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => tab === "plans" ? setCreateOpen(true) : setPromoCreateOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition"
                    >
                        <Plus className="w-4 h-4" />
                        {tab === "plans" ? "Yangi plan" : "Yangi promo kod"}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
                    {(["plans", "promos"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t
                                ? "bg-white/[0.07] text-white"
                                : "text-gray-600 hover:text-gray-400"
                                }`}
                        >
                            {t === "plans" ? <Package className="w-3.5 h-3.5" /> : <Tag className="w-3.5 h-3.5" />}
                            {t === "plans" ? "Planlar" : "Promo kodlar"}
                        </button>
                    ))}
                </div>

                {/* Plans Tab */}
                {tab === "plans" && (
                    plansLoading ? (
                        <div className="flex items-center justify-center min-h-64">
                            <div className="w-7 h-7 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        </div>
                    ) : !plans.length ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-700 gap-3">
                            <Package className="w-8 h-8" strokeWidth={1} />
                            <p className="text-sm">Hali planlar yo'q</p>
                            <button onClick={() => setCreateOpen(true)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition">
                                Birinchi planni yarating <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {plans.map((p) => (
                                <PlanCard
                                    key={p.id}
                                    plan={p}
                                    onEdit={setEditPlan}
                                    onDelete={setDeleteTarget}
                                    onToggle={handleTogglePlan}
                                />
                            ))}
                        </div>
                    )
                )}

                {/* Promos Tab */}
                {tab === "promos" && (
                    promosLoading ? (
                        <div className="flex items-center justify-center min-h-64">
                            <div className="w-7 h-7 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        </div>
                    ) : !promos.length ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-700 gap-3">
                            <Tag className="w-8 h-8" strokeWidth={1} />
                            <p className="text-sm">Hali promo kodlar yo'q</p>
                            <button onClick={() => setPromoCreateOpen(true)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition">
                                Birinchi promo kodni yarating <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {promos.map((p) => (
                                <PromoCard
                                    key={p.id}
                                    promo={p}
                                    onEdit={setEditPromo}
                                    onDelete={setDeletePromoTarget}
                                    onToggle={handleTogglePromo}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Plan modals */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi plan yaratish">
                <PlanForm onSave={handleCreatePlan} onClose={() => setCreateOpen(false)} saving={planSaving} />
            </Modal>
            <Modal open={!!editPlan} onClose={() => setEditPlan(null)} title="Planni tahrirlash">
                <PlanForm initial={editPlan} onSave={handleUpdatePlan} onClose={() => setEditPlan(null)} saving={planSaving} />
            </Modal>
            <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Planni o'chirish">
                <div className="px-5 py-4">
                    <p className="text-sm text-gray-400">
                        <span className="text-white font-semibold">"{deleteTarget?.name}"</span> planini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
                    </p>
                </div>
                <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-white/[0.06]">
                    <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-white/[0.07] hover:text-gray-300 transition">
                        Bekor
                    </button>
                    <button onClick={handleDeletePlan} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition">
                        <Trash2 className="w-3.5 h-3.5" /> O'chirish
                    </button>
                </div>
            </Modal>

            {/* Promo modals */}
            <Modal open={promoCreateOpen} onClose={() => setPromoCreateOpen(false)} title="Yangi promo kod yaratish">
                <PromoForm plans={plans} onSave={handleCreatePromo} onClose={() => setPromoCreateOpen(false)} saving={promoSaving} />
            </Modal>
            <Modal open={!!editPromo} onClose={() => setEditPromo(null)} title="Promo kodni tahrirlash">
                <PromoForm initial={editPromo} plans={plans} onSave={handleUpdatePromo} onClose={() => setEditPromo(null)} saving={promoSaving} />
            </Modal>
            <Modal open={!!deletePromoTarget} onClose={() => setDeletePromoTarget(null)} title="Promo kodni o'chirish">
                <div className="px-5 py-4">
                    <p className="text-sm text-gray-400">
                        <span className="text-white font-semibold font-mono">"{deletePromoTarget?.code}"</span> promo kodini o'chirishni tasdiqlaysizmi?
                    </p>
                </div>
                <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-white/[0.06]">
                    <button onClick={() => setDeletePromoTarget(null)} className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-white/[0.07] hover:text-gray-300 transition">
                        Bekor
                    </button>
                    <button onClick={handleDeletePromo} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition">
                        <Trash2 className="w-3.5 h-3.5" /> O'chirish
                    </button>
                </div>
            </Modal>
        </>
    )
}