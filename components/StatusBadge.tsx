import React from 'react'

export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'en-route': 'bg-indigo-100 text-indigo-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  const cls = map[status] || 'bg-gray-100 text-gray-800'
  return <span className={`px-2 py-1 rounded-full text-sm ${cls}`}>{status}</span>
}
