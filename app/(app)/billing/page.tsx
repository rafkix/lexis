"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Receipt, Wallet } from "lucide-react"
import Link from "next/link"
import PlanCard from "@/components/billing/PlanCard"
import CurrentSubscription from "@/components/billing/CurrentSubscription"
import { billingApi } from "@/lib/api/billing"
import type { Plan, Subscription } from "@/lib/types/billing"

export default function BillingPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [sub, setSub] = useState<Subscription | null>(null)
    const [loading, setLoading] = useState(true)
    const [subLoading, setSubLoading] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const [plansData, subData] = await Promise.all([
                    billingApi.getPlans(),
                    billingApi.getMySubscription(),
                ])
                setPlans(plansData)
                setSub(subData)
            } catch {
                toast.error("Failed to load billing data")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const handleSubscribe = async (slug: string) => {
        setSubLoading(slug)
        try {
            const newSub = await billingApi.subscribe({
                plan_slug: slug,
                auto_renew: true,
                provider: "manual",
            })
            setSub(newSub)
            toast.success("You're now subscribed!")
        } catch (e: any) {
            toast.error(e?.response?.data?.detail ?? "Something went wrong")
        } finally {
            setSubLoading(null)
        }
    }

    const handleCancel = async (reason: string) => {
        const cancelled = await billingApi.cancelSubscription(reason)
        setSub(cancelled)
        toast.success("Subscription cancelled")
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 gap-3">
                <div className="w-7 h-7 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading…</p>
            </div>
        )
    }

    const hasActiveSub = sub && ["active", "trial"].includes(sub.status)

    return (
        <div className="max-w-4xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Billing & Plans</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Manage your subscription</p>
                    </div>
                </div>

                <Link
                    href="/dashboard/billing/history"
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
                >
                    <Receipt className="w-3.5 h-3.5" />
                    History
                </Link>
            </div>

            {/* Current subscription */}
            {hasActiveSub && (
                <section>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                        Current subscription
                    </p>
                    <CurrentSubscription subscription={sub} onCancel={handleCancel} />
                </section>
            )}

            {/* Plans */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Available plans
                    </p>
                    <span className="text-xs text-gray-400">
                        {plans.length} plan{plans.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            isCurrentPlan={
                                sub?.plan_id === plan.id &&
                                ["active", "trial"].includes(sub?.status ?? "")
                            }
                            onSubscribe={handleSubscribe}
                            loading={subLoading === plan.slug}
                        />
                    ))}
                </div>

                <p className="text-center text-xs text-gray-400 mt-5">
                    30-day money-back guarantee · No hidden fees
                </p>
            </section>
        </div>
    )
}