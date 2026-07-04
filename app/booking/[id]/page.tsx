import dbConnect from '../../../../lib/mongo'
import { Booking } from '../../../../models'
import { StatusBadge } from '../../../../components/StatusBadge'

interface Props { params: { id: string } }

export default async function BookingDetail({ params }: Props) {
  await dbConnect()
  const booking = await Booking.findById(params.id).populate('serviceId technicianId customerId').lean()
  if (!booking) return <div className="p-4">Booking not found</div>

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">Booking Detail</h1>
      <p className="mt-2">Status: <span className="ml-2 px-2 py-1 rounded-full bg-gray-100">{booking.status}</span></p>
      <div className="mt-4">
        <h3 className="font-semibold">Service</h3>
        <p>{booking.serviceId?.name}</p>

        <h3 className="font-semibold mt-2">Customer</h3>
        <p>{booking.customerId?.name} — {booking.customerId?.phone}</p>

        <h3 className="font-semibold mt-2">Technician</h3>
        <p>{booking.technicianId?.name || 'Not assigned'}</p>

        <h3 className="font-semibold mt-2">Address</h3>
        <p>{booking.address?.line1}, {booking.address?.city} {booking.address?.pincode}</p>
      </div>
    </main>
  )
}
