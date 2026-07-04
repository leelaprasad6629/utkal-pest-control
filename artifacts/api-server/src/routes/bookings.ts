import { Router, type IRouter } from "express";
import { z } from "zod";
import { dbConnect } from "../lib/mongo";
import { Booking, Service, User } from "../models";
import { requireAuth } from "../lib/clerkAuth";
import { clerkClient } from "../lib/clerkAuth";

const router: IRouter = Router();

const AddressInput = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  pincode: z.string().optional(),
  landmark: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const BookingInput = z.object({
  serviceId: z.string().min(1),
  address: AddressInput,
  scheduledDate: z.string().min(1),
  timeSlot: z.string().min(1),
  notes: z.string().optional(),
});

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
    .populate("technicianId", "name email")
    .populate("customerId", "name email phone")
    .sort({ createdAt: -1 })
    .lean();

  res.json(bookings);
});

router.post("/bookings", requireAuth, async (req, res): Promise<void> => {
  const parsed = BookingInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await dbConnect();
  const localUser = await findOrCreateLocalUser(req.clerkUserId!);
  const service = await Service.findById(parsed.data.serviceId).lean<{ basePrice?: number } | null>();
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  const booking = await Booking.create({
    customerId: localUser._id,
    serviceId: parsed.data.serviceId,
    address: parsed.data.address,
    scheduledDate: new Date(parsed.data.scheduledDate),
    timeSlot: parsed.data.timeSlot,
    price: service.basePrice,
    status: "pending",
    paymentStatus: "pending",
  });

  req.log.info({ bookingId: booking._id }, "Created booking");
  res.status(201).json(booking);
});

router.patch("/bookings/:id/status", requireAuth, async (req, res): Promise<void> => {
  const raw = req.params.id;
  const id = Array.isArray(raw) ? raw[0] : raw;

  const StatusInput = z.object({
    status: z.enum(["pending", "confirmed", "en-route", "in-progress", "completed", "cancelled"]),
  });
  const parsed = StatusInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await dbConnect();
  const localUser = await User.findOne({ clerkId: req.clerkUserId }).lean<{ role: string } | null>();
  if (!localUser || (localUser.role !== "admin" && localUser.role !== "technician")) {
    res.status(403).json({ error: "Not authorized to update booking status" });
    return;
  }

  const booking = await Booking.findByIdAndUpdate(id, { status: parsed.data.status }, { new: true });
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json(booking);
});

export default router;
