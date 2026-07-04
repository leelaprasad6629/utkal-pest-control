export interface ServiceItem {
  _id: string;
  name: string;
  slug: string;
  category?: string;
  description?: string;
  basePrice?: number;
  icon?: string;
  active: boolean;
}

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

export interface Booking {
  _id: string;
  customerId?: { _id: string; name: string; email: string; phone?: string } | string;
  serviceId?: ServiceItem | string;
  technicianId?: { _id: string; name: string; email: string } | string;
  address?: Address;
  scheduledDate?: string;
  timeSlot?: string;
  status: "pending" | "confirmed" | "en-route" | "in-progress" | "completed" | "cancelled";
  price?: number;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt?: string;
}

export interface LocalUser {
  _id?: string;
  name: string;
  email: string;
  role: "customer" | "technician" | "admin";
  exists?: boolean;
}
