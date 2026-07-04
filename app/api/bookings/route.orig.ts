import dbConnect from '@/lib/mongo'
import { Booking } from '@/models'

export async function GET() {
  await dbConnect()
  const bookings = await Booking.find({}).populate('serviceId technicianId customerId').lean()
  return new Response(JSON.stringify(bookings), { status: 200 })
}

export async function POST(request: Request) {
  const body = await request.json()
  await dbConnect()
  const booking = await Booking.create(body)
  return new Response(JSON.stringify(booking), { status: 201 })
}
