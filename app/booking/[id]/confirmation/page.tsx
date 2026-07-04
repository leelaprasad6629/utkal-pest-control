import dbConnect from '@/lib/mongo'
import { Booking } from '@/models'

interface Props { params: { id: string } }

export default async function Confirmation({ params }: Props) {
  await dbConnect()
  const booking = await Booking.findById(params.id).populate('serviceId technicianId customerId').lean()
  if (!booking) return <div className="p-4">Booking not found</div>

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">Booking Confirmation</h1>
      <p className="mt-2">Status: {booking.status}</p>
      <div className="mt-4">
        <h3 className="font-semibold">Summary</h3>
        <p>Service: {booking.serviceId?.name}</p>
        <p>Scheduled: {new Date(booking.scheduledDate).toLocaleString()}</p>
        <p>Time slot: {booking.timeSlot}</p>
        <p>Address: {booking.address?.line1}, {booking.address?.city}</p>
      </div>
    </main>
  )
}
