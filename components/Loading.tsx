import React from 'react'

export default function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="p-6 text-center text-gray-600">
      <div className="animate-pulse">{text}</div>
    </div>
  )
}
