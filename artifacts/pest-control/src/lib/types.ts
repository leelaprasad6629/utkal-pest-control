export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceItem {
  _id: string;
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
  faqs?: ServiceFaq[];
}

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

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
  changedAt: string;
}

export interface PersonRef {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  customerId?: PersonRef | string;
  serviceId?: ServiceItem | string;
  technicianId?: PersonRef | string;
  address?: Address;
  propertyType?: "residential" | "commercial";
  areaSize?: number;
  scheduledDate?: string;
  timeSlot?: string;
  notes?: string;
  images?: string[];
  emergency?: boolean;
  status: BookingStatus;
  statusHistory: BookingStatusHistoryEntry[];
  price?: number;
  paymentStatus: "pending" | "paid" | "failed";
  cancelledReason?: string;
  createdAt?: string;
}

export interface LocalUser {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "technician" | "admin";
  exists?: boolean;
}

export type NotificationType =
  | "booking_confirmed"
  | "status_update"
  | "technician_assigned"
  | "payment_success"
  | "service_reminder"
  | "completion"
  | "review_request"
  | "cancelled";

export interface AppNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedBookingId?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  bookingId?: string;
  serviceId?: ServiceItem | string;
  customerId?: PersonRef | string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  bookingId: Booking | string;
  customerId: PersonRef | string;
  amount: number;
  tax: number;
  total: number;
  status: "unpaid" | "paid";
  issuedAt: string;
  createdAt: string;
}

export interface ServiceReport {
  _id: string;
  bookingId: string;
  technicianId: string;
  beforeImages: string[];
  afterImages: string[];
  notes?: string;
  customerSignature?: string;
  completedAt: string;
}

export interface TechnicianRecord {
  _id: string;
  userId?: PersonRef;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  city?: string;
  profileImage?: string;
  status: "active" | "inactive";
  availability: { day: string; from: string; to: string }[];
  rating: number;
  specialties?: string[];
}

export interface PublicStats {
  totalCustomers: number;
  totalBookings: number;
  totalTechnicians: number;
  averageRating: number | null;
  reviewCount: number;
}

export interface AdminAnalytics {
  totalBookings: number;
  bookingsByStatus: Record<string, number>;
  totalRevenue: number;
  totalCustomers: number;
  totalTechnicians: number;
  averageRating: number | null;
  reviewCount: number;
  topServices: { name: string; count: number }[];
}
