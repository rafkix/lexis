import React from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: BreadcrumbItem[]
  action?: React.ReactNode
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export function PageHeader({ title, subtitle, breadcrumb, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex flex-col gap-1">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
            {breadcrumb.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                {item.href ? (
                  <Link href={item.href} className="hover:text-indigo-600 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 font-medium">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-[22px] font-bold text-slate-800 leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-slate-400">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
