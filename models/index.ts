import mongoose, { Schema, model, models } from 'mongoose'

const AddressSchema = new Schema({
  line1: String,
  line2: String,
  city: String,
  state: String,
  pincode: String,
  landmark: String
})

const UserSchema = new Schema({
  name: { type: String, required: true },
  phone: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['customer', 'technician', 'admin'], default: 'customer' },
  clerkId: String,
  addresses: [AddressSchema]
}, { timestamps: true })

const ServiceSchema = new Schema({
  name: String,
  slug: { type: String, index: true },
  category: String,
  description: String,
  basePrice: Number,
  icon: String
}, { timestamps: true })

const BookingSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'User' },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
  technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
  address: Object,
  scheduledDate: Date,
  timeSlot: String,
  status: { type: String, enum: ['pending','confirmed','en-route','in-progress','completed','cancelled'], default: 'pending' },
  price: Number,
  paymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'pending' }
}, { timestamps: true })

const TechnicianSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedBookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
  availability: [{ day: String, from: String, to: String }],
  rating: { type: Number, default: 4.5 }
}, { timestamps: true })

const ReviewSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  customerId: { type: Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  comment: String
}, { timestamps: true })

const PaymentSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  amount: Number,
  status: { type: String, enum: ['pending','successful','failed'], default: 'pending' },
  method: String
}, { timestamps: true })

export const User = models.User || model('User', UserSchema)
export const Service = models.Service || model('Service', ServiceSchema)
export const Booking = models.Booking || model('Booking', BookingSchema)
export const Technician = models.Technician || model('Technician', TechnicianSchema)
export const Review = models.Review || model('Review', ReviewSchema)
export const Payment = models.Payment || model('Payment', PaymentSchema)
