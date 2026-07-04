import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-4">
      <header className="mb-4">
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </header>
      <div>{children}</div>
    </div>
  )
}
