'use client'

import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T> {
  header: string
  accessor: keyof T
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable<T>({ columns, data, emptyMessage = 'No data' }: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full table-auto border-collapse text-sm">
        <thead className="bg-indigo-50">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="text-left py-2.5 px-4 text-xs font-semibold text-indigo-600 uppercase tracking-wide"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-sm text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="py-2.5 px-4 text-slate-700">
                    {col.render
                      ? col.render(row[col.accessor], row)
                      : String(row[col.accessor] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
