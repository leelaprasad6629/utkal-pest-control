import React from 'react'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../../lib/mongo'
import { User, Booking } from '../../models'
import StatusBadge from '../../components/StatusBadge'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'

export default async function MyBookingsPage() {
  const { userId } = auth()
  if (!userId) return <div className="p-4">Please sign in.</div>

  await dbConnect()
  const user = await User.findOne({ clerkId: userId })
  if (!user) return <div className="p-4">No user record found.</div>

  const bookings = await Booking.find({ customerId: user._id }).populate('serviceId technicianId').sort({ scheduledDate: -1 }).lean()

  if (!bookings) return <Loading />
  if (bookings.length === 0) return <EmptyState title="No bookings yet" subtitle="You don't have any bookings. Book a service to get started." />

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">My Bookings</h1>
      <div className="mt-4 space-y-3">
        {bookings.map(b => (
          <div key={b._id} className="p-3 border rounded">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{b.serviceId?.name}</div>
                <div className="text-sm text-gray-600">{new Date(b.scheduledDate).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <StatusBadge status={b.status} />
                <div className="mt-2"><a href={`/booking/${b._id}`} className="text-sm text-accent">View details</a></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
