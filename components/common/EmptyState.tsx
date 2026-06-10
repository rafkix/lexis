import React from 'react'

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  message?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({
  message = 'No data available',
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400">
          {icon}
        </div>
      )}
      <p className="text-[14px] font-semibold text-slate-700">{message}</p>
      {description && (
        <p className="text-[12.5px] text-slate-400 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
