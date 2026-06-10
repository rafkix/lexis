import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Status = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface StatusBadgeProps {
  status: Status
  children: React.ReactNode
  size?: 'sm' | 'md'
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES: Record<Status, string> = {
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  error:   'bg-red-100 text-red-800',
  info:    'bg-indigo-100 text-indigo-700',
  neutral: 'bg-slate-100 text-slate-600',
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status, children, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
        STYLES[status],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
