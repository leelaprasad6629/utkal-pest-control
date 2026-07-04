'use client'

import React, { useEffect, useState } from 'react'

type Service = { _id: string, name: string }

export default function QuotePage() {
  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState('')
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<'idle'|'submitting'|'done'|'error'>('idle')

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices).catch(console.error)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    try {
      const payload = {
        serviceId,
        address: { line1: address, city: '', state: '', pincode },
        scheduledDate: date ? new Date(date).toISOString() : null,
        timeSlot: '09:00-11:00',
        status: 'pending'
      }
      const res = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (res.ok) {
        const booking = await res.json()
        setStatus('done')
        // redirect to confirmation
        window.location.href = `/booking/${booking._id}/confirmation`
      } else {
        setStatus('error')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-primary">Get a Quote / Book Service</h1>
      <form className="mt-4 max-w-md" onSubmit={handleSubmit}>
        <label className="block mb-2">Service
          <select className="w-full border p-2 mt-1" value={serviceId} onChange={e => setServiceId(e.target.value)} required>
            <option value="">Select a service</option>
            {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </label>
        <label className="block mb-2">Address
          <input className="w-full border p-2 mt-1" value={address} onChange={e => setAddress(e.target.value)} required />
        </label>
        <label className="block mb-2">Pincode
          <input className="w-full border p-2 mt-1" value={pincode} onChange={e => setPincode(e.target.value)} required />
        </label>
        <label className="block mb-2">Preferred Date
          <input type="date" className="w-full border p-2 mt-1" value={date} onChange={e => setDate(e.target.value)} />
        </label>
        <div className="mt-4">
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Submitting...' : 'Request Quote'}
          </button>
        </div>
        {status === 'error' && <p className="mt-2 text-red-600">Error creating quote. Try again later.</p>}
      </form>
    </main>
  )
}
