import dbConnect from '@/lib/mongo'
import { Booking } from '@/models'

export async function createBooking({ serviceId, address, scheduledDate, timeSlot, customerId, price }: any) {
  await dbConnect()
  const data: any = { serviceId, address, scheduledDate, timeSlot, price }
  if (customerId) data.customerId = customerId
  const booking = await Booking.create(data)
  return booking
}
