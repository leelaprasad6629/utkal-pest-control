import dbConnect from '../../../lib/mongo'
import { Booking } from '../../../models'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'

const AddressSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  pincode: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
})

const BookingSchema = z.object({
  serviceId: z.string(),
  address: AddressSchema,
  scheduledDate: z.string().nullable().optional(),
  timeSlot: z.string().optional(),
  price: z.number().optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = BookingSchema.parse(body)
    await dbConnect()

    // If user is authenticated via Clerk, map clerkId to User._id
    let customerId: any = undefined
    try {
      const { userId } = auth()
      if (userId) {
        const User = (await import('../../../models')).User
        const user = await User.findOne({ clerkId: userId })
        if (user) customerId = user._id
      }
    } catch (e) {
      // auth failed or not present — proceed as guest booking
    }

    const createData: any = {
      serviceId: parsed.serviceId,
      address: parsed.address,
      scheduledDate: parsed.scheduledDate ? new Date(parsed.scheduledDate) : null,
      timeSlot: parsed.timeSlot || '09:00-11:00',
      price: parsed.price || undefined
    }
    if (customerId) createData.customerId = customerId

    const booking = await Booking.create(createData)
    return new Response(JSON.stringify(booking), { status: 201 })
  } catch (err: any) {
    console.error('booking POST error', err)
    return new Response(JSON.stringify({ error: err?.message || 'Invalid' }), { status: 400 })
  }
}
