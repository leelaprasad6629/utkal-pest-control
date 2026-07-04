import mongoose, { Schema } from "mongoose";

const { models, model } = mongoose;

export interface AddressDoc {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

const AddressSchema = new Schema<AddressDoc>(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    lat: Number,
    lng: Number,
  },
  { _id: false },
);

export interface UserDoc extends mongoose.Document {
  name: string;
  phone?: string;
  email: string;
  role: "customer" | "technician" | "admin";
  clerkId?: string;
  addresses: AddressDoc[];
}

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true },
    phone: String,
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["customer", "technician", "admin"],
      default: "customer",
    },
    clerkId: { type: String, index: true },
    addresses: [AddressSchema],
  },
  { timestamps: true },
);

export interface ServiceDoc extends mongoose.Document {
  name: string;
  slug: string;
  category?: string;
  description?: string;
  basePrice?: number;
  icon?: string;
  active: boolean;
}

const ServiceSchema = new Schema<ServiceDoc>(
  {
    name: String,
    slug: { type: String, index: true },
    category: String,
    description: String,
    basePrice: Number,
    icon: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export interface BookingDoc extends mongoose.Document {
  customerId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  technicianId?: mongoose.Types.ObjectId;
  address?: AddressDoc;
  scheduledDate?: Date;
  timeSlot?: string;
  status: "pending" | "confirmed" | "en-route" | "in-progress" | "completed" | "cancelled";
  price?: number;
  paymentStatus: "pending" | "paid" | "failed";
}

const BookingSchema = new Schema<BookingDoc>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    technicianId: { type: Schema.Types.ObjectId, ref: "User" },
    address: AddressSchema,
    scheduledDate: Date,
    timeSlot: String,
    status: {
      type: String,
      enum: ["pending", "confirmed", "en-route", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    price: Number,
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  },
  { timestamps: true },
);

export interface TechnicianDoc extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  assignedBookings: mongoose.Types.ObjectId[];
  availability: { day: string; from: string; to: string }[];
  rating: number;
}

const TechnicianSchema = new Schema<TechnicianDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    assignedBookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    availability: [{ day: String, from: String, to: String }],
    rating: { type: Number, default: 4.5 },
  },
  { timestamps: true },
);

export interface ReviewDoc extends mongoose.Document {
  bookingId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  rating?: number;
  comment?: string;
}

const ReviewSchema = new Schema<ReviewDoc>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    rating: Number,
    comment: String,
  },
  { timestamps: true },
);

export interface PaymentDoc extends mongoose.Document {
  bookingId?: mongoose.Types.ObjectId;
  amount?: number;
  status: "pending" | "successful" | "failed";
  method?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

const PaymentSchema = new Schema<PaymentDoc>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    amount: Number,
    status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
    method: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true },
);

export interface ContactMessageDoc extends mongoose.Document {
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Date;
}

const ContactMessageSchema = new Schema<ContactMessageDoc>({
  name: String,
  email: String,
  phone: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model<UserDoc>("User", UserSchema);
export const Service = models.Service || model<ServiceDoc>("Service", ServiceSchema);
export const Booking = models.Booking || model<BookingDoc>("Booking", BookingSchema);
export const Technician = models.Technician || model<TechnicianDoc>("Technician", TechnicianSchema);
export const Review = models.Review || model<ReviewDoc>("Review", ReviewSchema);
export const Payment = models.Payment || model<PaymentDoc>("Payment", PaymentSchema);
export const ContactMessage =
  models.ContactMessage || model<ContactMessageDoc>("ContactMessage", ContactMessageSchema);
