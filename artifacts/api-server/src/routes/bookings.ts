import { Router, type IRouter } from "express";
import { z } from "zod";
import { dbConnect } from "../lib/mongo";
import { Booking, Invoice, Service, User } from "../models";
import { requireAuth, clerkClient } from "../lib/clerkAuth";
import { generateBookingNumber, generateInvoiceNumber } from "../lib/ids";
import { createNotification } from "../lib/notifications";
import {
  sendBookingConfirmation,
  sendStatusUpdateEmail,
  sendTechnicianAssignedEmail,
  sendCompletionEmail,
} from "../lib/mailer";

const router: IRouter = Router();

const AddressInput = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  pincode: z.string().min(1),
  landmark: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const BookingInput = z.object({
  serviceId: z.string().min(1),
  address: AddressInput,
  propertyType: z.enum(["residential", "commercial"]).optional(),
  areaSize: z.number().positive().optional(),
  scheduledDate: z.string().min(1),
  timeSlot: z.string().min(1),
  notes: z.string().optional(),
  images: z.array(z.string()).optional(),
  emergency: z.boolean().optional(),
});

const STATUS_VALUES = [
  "pending",
  "confirmed",
  "technician-assigned",
  "en-route",
  "in-progress",
  "completed",
  "cancelled",
] as const;

async function findOrCreateLocalUser(clerkUserId: string): Promise<InstanceType<typeof User>> {
  let user = await User.findOne({ clerkId: clerkUserId });
  if (user) return user;

  let name = "Customer";
  let email = `${clerkUserId}@placeholder.local`;
  if (clerkClient) {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || name;
      email = clerkUser.emailAddresses[0]?.emailAddress ?? email;
    } catch {
      // fall back to placeholder values
    }
  }

  user = await User.create({ name, email, clerkId: clerkUserId, role: "customer" });
  return user;
}

async function getLocalUser(clerkUserId?: string) {
  if (!clerkUserId) return null;
  return User.findOne({ clerkId: clerkUserId });
}

router.get("/bookings", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const localUser = await User.findOne({ clerkId: req.clerkUserId }).lean<{
    _id: unknown;
    role: string;
  } | null>();

  if (!localUser) {
    res.json([]);
    return;
  }

  const filter =
    localUser.role === "admin"
      ? {}
      : localUser.role === "technician"
        ? { technicianId: localUser._id }
        : { customerId: localUser._id };

  const bookings = await Booking.find(filter)
    .populate("serviceId")
    .populate("technicianId", "name email phone")
    .populate("customerId", "name email phone")
    .sort({ createdAt: -1 })
    .lean();

  res.json(bookings);
});

router.get("/bookings/:id", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const localUser = await User.findOne({ clerkId: req.clerkUserId }).lean<{
    _id: unknown;
    role: string;
  } | null>();
  if (!localUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const booking = await Booking.findById(req.params.id)
    .populate("serviceId")
    .populate("technicianId", "name email phone")
    .populate("customerId", "name email phone")
    .lean<{ customerId?: { _id: unknown } | null; technicianId?: { _id: unknown } | null } | null>();

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const isOwner = String(booking.customerId?._id) === String(localUser._id);
  const isAssignedTech = String(booking.technicianId?._id) === String(localUser._id);
  if (localUser.role !== "admin" && !isOwner && !isAssignedTech) {
    res.status(403).json({ error: "Not authorized to view this booking" });
    return;
  }

  res.json(booking);
});

router.post("/bookings", requireAuth, async (req, res): Promise<void> => {
  const parsed = BookingInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }

  await dbConnect();
  const localUser = await findOrCreateLocalUser(req.clerkUserId!);
  const service = await Service.findById(parsed.data.serviceId).lean<{ name?: string; basePrice?: number } | null>();
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  const bookingNumber = generateBookingNumber();
  const scheduledDate = new Date(parsed.data.scheduledDate);
  if (Number.isNaN(scheduledDate.getTime())) {
    res.status(400).json({ error: "Invalid scheduled date" });
    return;
  }

  const booking = await Booking.create({
    bookingNumber,
    customerId: localUser._id,
    serviceId: parsed.data.serviceId,
    address: parsed.data.address,
    propertyType: parsed.data.propertyType,
    areaSize: parsed.data.areaSize,
    scheduledDate,
    timeSlot: parsed.data.timeSlot,
    notes: parsed.data.notes,
    images: parsed.data.images ?? [],
    emergency: parsed.data.emergency ?? false,
    price: service.basePrice,
    status: "pending",
    paymentStatus: "pending",
    statusHistory: [{ status: "pending", changedAt: new Date() }],
  });

  await createNotification({
    userId: localUser._id,
    type: "booking_confirmed",
    title: "Booking received",
    message: `Your booking ${bookingNumber} for ${service.name} has been received and is pending confirmation.`,
    relatedBookingId: booking._id,
  });

  void sendBookingConfirmation({
    to: localUser.email,
    customerName: localUser.name,
    bookingNumber,
    serviceName: service.name ?? "service",
    scheduledDate: scheduledDate.toLocaleDateString(),
    timeSlot: parsed.data.timeSlot,
  });

  req.log.info({ bookingId: booking._id }, "Created booking");
  res.status(201).json(booking);
});

router.patch("/bookings/:id/status", requireAuth, async (req, res): Promise<void> => {
  const id = req.params.id;

  const StatusInput = z.object({
    status: z.enum(STATUS_VALUES),
    note: z.string().optional(),
    technicianId: z.string().optional(),
  });
  const parsed = StatusInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }

  await dbConnect();
  const localUser = await getLocalUser(req.clerkUserId);
  if (!localUser || (localUser.role !== "admin" && localUser.role !== "technician")) {
    res.status(403).json({ error: "Not authorized to update booking status" });
    return;
  }

  const booking = await Booking.findById(id).populate("serviceId").populate("customerId");
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if (localUser.role === "technician" && String(booking.technicianId) !== String(localUser._id)) {
    res.status(403).json({ error: "Not assigned to this booking" });
    return;
  }

  if (parsed.data.technicianId && localUser.role === "admin") {
    booking.technicianId = parsed.data.technicianId as unknown as typeof booking.technicianId;
  }

  booking.status = parsed.data.status;
  booking.statusHistory.push({
    status: parsed.data.status,
    note: parsed.data.note,
    changedBy: localUser._id,
    changedAt: new Date(),
  });
  await booking.save();

  const customer = booking.customerId as unknown as { _id: unknown; name: string; email: string } | null;
  const service = booking.serviceId as unknown as { name?: string } | null;

  if (customer) {
    await createNotification({
      userId: customer._id as never,
      type: parsed.data.technicianId ? "technician_assigned" : "status_update",
      title: "Booking update",
      message: `Booking ${booking.bookingNumber} is now: ${parsed.data.status.replace("-", " ")}.`,
      relatedBookingId: booking._id,
    });

    if (parsed.data.technicianId) {
      const tech = await User.findById(parsed.data.technicianId).lean<{ name: string } | null>();
      void sendTechnicianAssignedEmail({
        to: customer.email,
        customerName: customer.name,
        bookingNumber: booking.bookingNumber,
        technicianName: tech?.name ?? "your technician",
      });
    } else {
      void sendStatusUpdateEmail({
        to: customer.email,
        customerName: customer.name,
        bookingNumber: booking.bookingNumber,
        status: parsed.data.status,
      });
    }

    if (parsed.data.status === "completed") {
      const existingInvoice = await Invoice.findOne({ bookingId: booking._id });
      if (!existingInvoice && booking.price) {
        const tax = Math.round(booking.price * 0.18);
        await Invoice.create({
          invoiceNumber: generateInvoiceNumber(),
          bookingId: booking._id,
          customerId: customer._id,
          amount: booking.price,
          tax,
          total: booking.price + tax,
          status: booking.paymentStatus === "paid" ? "paid" : "unpaid",
        });
      }
      await createNotification({
        userId: customer._id as never,
        type: "review_request",
        title: "How did we do?",
        message: `Your service for booking ${booking.bookingNumber} is complete. Please leave a review!`,
        relatedBookingId: booking._id,
      });
      void sendCompletionEmail({
        to: customer.email,
        customerName: customer.name,
        bookingNumber: booking.bookingNumber,
      });
    }
    void service;
  }

  res.json(booking);
});

router.post("/bookings/:id/cancel", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const localUser = await getLocalUser(req.clerkUserId);
  if (!localUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const isOwner = String(booking.customerId) === String(localUser._id);
  if (!isOwner && localUser.role !== "admin") {
    res.status(403).json({ error: "Not authorized to cancel this booking" });
    return;
  }

  if (["completed", "cancelled"].includes(booking.status)) {
    res.status(400).json({ error: `Booking already ${booking.status}` });
    return;
  }

  const reason = typeof req.body?.reason === "string" ? req.body.reason : undefined;
  booking.status = "cancelled";
  booking.cancelledReason = reason;
  booking.statusHistory.push({ status: "cancelled", note: reason, changedBy: localUser._id, changedAt: new Date() });
  await booking.save();

  await createNotification({
    userId: booking.customerId as never,
    type: "cancelled",
    title: "Booking cancelled",
    message: `Booking ${booking.bookingNumber} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
    relatedBookingId: booking._id,
  });

  res.json(booking);
});

router.post("/bookings/:id/reschedule", requireAuth, async (req, res): Promise<void> => {
  const RescheduleInput = z.object({
    scheduledDate: z.string().min(1),
    timeSlot: z.string().min(1),
  });
  const parsed = RescheduleInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }

  await dbConnect();
  const localUser = await getLocalUser(req.clerkUserId);
  if (!localUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const isOwner = String(booking.customerId) === String(localUser._id);
  if (!isOwner && localUser.role !== "admin") {
    res.status(403).json({ error: "Not authorized to reschedule this booking" });
    return;
  }

  if (["completed", "cancelled"].includes(booking.status)) {
    res.status(400).json({ error: `Cannot reschedule a ${booking.status} booking` });
    return;
  }

  const newDate = new Date(parsed.data.scheduledDate);
  if (Number.isNaN(newDate.getTime())) {
    res.status(400).json({ error: "Invalid scheduled date" });
    return;
  }

  booking.scheduledDate = newDate;
  booking.timeSlot = parsed.data.timeSlot;
  booking.statusHistory.push({
    status: booking.status,
    note: `Rescheduled to ${newDate.toLocaleDateString()} (${parsed.data.timeSlot})`,
    changedBy: localUser._id,
    changedAt: new Date(),
  });
  await booking.save();

  await createNotification({
    userId: booking.customerId as never,
    type: "status_update",
    title: "Booking rescheduled",
    message: `Booking ${booking.bookingNumber} has been rescheduled to ${newDate.toLocaleDateString()}.`,
    relatedBookingId: booking._id,
  });

  res.json(booking);
});

export default router;
