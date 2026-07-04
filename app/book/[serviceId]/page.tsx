'use client'

import React from 'react'
import BookingSteps from '../../../components/BookingSteps'

export default async function BookServicePage({ params }: { params: { serviceId: string } }) {
  // Note: this is rendered on client; we fetch service info client-side
  const [service, setService] = React.useState<any>(null)

  React.useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(list => {
      const s = list.find((x: any) => x._id === params.serviceId)
      setService(s)
    }).catch(console.error)
  }, [params.serviceId])

  if (!service) return <div className="p-4">Loading...</div>

  return (
    <main className="p-4">
      <BookingSteps serviceId={params.serviceId} serviceName={service.name} />
    </main>
  )
}
