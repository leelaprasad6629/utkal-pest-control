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

export interface GeoCacheDoc extends mongoose.Document {
  query: string;
  lat: number;
  lng: number;
}

const GeoCacheSchema = new Schema<GeoCacheDoc>(
  {
    query: { type: String, unique: true, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { timestamps: true },
);

export const GeoCache = models.GeoCache || model<GeoCacheDoc>("GeoCache", GeoCacheSchema);

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
  duration?: string;
  features?: string[];
  benefits?: string[];
  process?: string[];
  safetyMeasures?: string[];
  faqs?: { question: string; answer: string }[];
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
    duration: String,
    features: [String],
    benefits: [String],
    process: [String],
    safetyMeasures: [String],
    faqs: [{ question: String, answer: String, _id: false }],
  },
  { timestamps: true },
);

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "technician-assigned"
  | "en-route"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface BookingStatusHistoryEntry {
  status: BookingStatus;
  note?: string;
  changedBy?: mongoose.Types.ObjectId;
  changedAt: Date;
}

const BookingStatusHistorySchema = new Schema<BookingStatusHistoryEntry>(
  {
    status: { type: String, required: true },
    note: String,
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export interface BookingDoc extends mongoose.Document {
  bookingNumber: string;
  customerId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  technicianId?: mongoose.Types.ObjectId;
  address?: AddressDoc;
  propertyType?: "residential" | "commercial";
  areaSize?: number;
  scheduledDate?: Date;
  timeSlot?: string;
  notes?: string;
  images: string[];
  emergency: boolean;
  status: BookingStatus;
  statusHistory: BookingStatusHistoryEntry[];
  price?: number;
  paymentStatus: "pending" | "paid" | "failed";
  cancelledReason?: string;
}

const BookingSchema = new Schema<BookingDoc>(
  {
    bookingNumber: { type: String, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    technicianId: { type: Schema.Types.ObjectId, ref: "User" },
    address: AddressSchema,
    propertyType: { type: String, enum: ["residential", "commercial"] },
    areaSize: Number,
    scheduledDate: Date,
    timeSlot: String,
    notes: String,
    images: [String],
    emergency: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "confirmed", "technician-assigned", "en-route", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    statusHistory: [BookingStatusHistorySchema],
    price: Number,
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    cancelledReason: String,
  },
  { timestamps: true },
);

export interface TechnicianDoc extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  city?: string;
  profileImage?: string;
  status: "active" | "inactive";
  assignedBookings: mongoose.Types.ObjectId[];
  availability: { day: string; from: string; to: string }[];
  rating: number;
  specialties?: string[];
}

const TechnicianSchema = new Schema<TechnicianDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, index: true },
    phone: String,
    specialization: String,
    experience: Number,
    city: String,
    profileImage: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    assignedBookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    availability: [{ day: String, from: String, to: String, _id: false }],
    rating: { type: Number, default: 0 },
    specialties: [String],
  },
  { timestamps: true },
);

export interface ReviewDoc extends mongoose.Document {
  bookingId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  rating?: number;
  comment?: string;
  images?: string[];
}

const ReviewSchema = new Schema<ReviewDoc>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    rating: Number,
    comment: String,
    images: [String],
  },
  { timestamps: true },
);

export interface PaymentDoc extends mongoose.Document {
  bookingId?: mongoose.Types.ObjectId;
  amount?: number;
  currency: string;
  status: "pending" | "successful" | "failed";
  method?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

const PaymentSchema = new Schema<PaymentDoc>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    amount: Number,
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
    method: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
  },
  { timestamps: true },
);

export interface InvoiceDoc extends mongoose.Document {
  invoiceNumber: string;
  bookingId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  tax: number;
  total: number;
  status: "unpaid" | "paid";
  issuedAt: Date;
}

const InvoiceSchema = new Schema<InvoiceDoc>(
  {
    invoiceNumber: { type: String, unique: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export interface ServiceReportDoc extends mongoose.Document {
  bookingId: mongoose.Types.ObjectId;
  technicianId: mongoose.Types.ObjectId;
  beforeImages: string[];
  afterImages: string[];
  notes?: string;
  customerSignature?: string;
  completedAt: Date;
}

const ServiceReportSchema = new Schema<ServiceReportDoc>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    technicianId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    beforeImages: [String],
    afterImages: [String],
    notes: String,
    customerSignature: String,
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type NotificationType =
  | "booking_confirmed"
  | "status_update"
  | "technician_assigned"
  | "payment_success"
  | "service_reminder"
  | "completion"
  | "review_request"
  | "cancelled";

export interface NotificationDoc extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedBookingId?: mongoose.Types.ObjectId;
}

const NotificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedBookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
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
export const Invoice = models.Invoice || model<InvoiceDoc>("Invoice", InvoiceSchema);
export const ServiceReport = models.ServiceReport || model<ServiceReportDoc>("ServiceReport", ServiceReportSchema);
export const Notification = models.Notification || model<NotificationDoc>("Notification", NotificationSchema);
export const ContactMessage =
  models.ContactMessage || model<ContactMessageDoc>("ContactMessage", ContactMessageSchema);
