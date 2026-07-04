import { z } from 'zod'

export const addressSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  pincode: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
})

export const bookingCreateSchema = z.object({
  serviceId: z.string(),
  address: addressSchema,
  scheduledDate: z.string().nullable().optional(),
  timeSlot: z.string().optional(),
  price: z.number().optional()
})

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>
