import React from 'react'

export default function EmptyState({ title, subtitle }: { title: string, subtitle?: string }) {
  return (
    <div className="p-6 text-center text-gray-600">
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="mt-2 text-sm">{subtitle}</p>}
    </div>
  )
}
