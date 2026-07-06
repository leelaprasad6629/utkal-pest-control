import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { dbConnect } from "../lib/mongo";
import { Booking, Payment, Review, Service, Technician, User } from "../models";
import { requireAuth } from "../lib/clerkAuth";

const router: IRouter = Router();

/** Accept both "admin" and the legacy "manager" value (normalized at sync time but belt-and-suspenders here). */
function isAdminRole(role: string): boolean {
  return role === "admin" || role === "manager";
}

async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  await dbConnect();
  const user = await User.findOne({ clerkId: req.clerkUserId }).lean<{ role: string } | null>();
  if (!user || !isAdminRole(user.role)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

router.get("/admin/analytics", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const [totalBookings, statusCounts, revenueAgg, totalCustomers, totalTechnicians, avgRatingAgg] = await Promise.all(
    [
      Booking.countDocuments({}),
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Payment.aggregate([
        { $match: { status: "successful" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "technician" }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }]),
    ],
  );

  const bookingsByStatus: Record<string, number> = {};
  for (const row of statusCounts as { _id: string; count: number }[]) {
    bookingsByStatus[row._id] = row.count;
  }

  const topServices = await Booking.aggregate([
    { $group: { _id: "$serviceId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: "services", localField: "_id", foreignField: "_id", as: "service" } },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, name: "$service.name", count: 1 } },
  ]);

  res.json({
    totalBookings,
    bookingsByStatus,
    totalRevenue: (revenueAgg[0] as { total?: number } | undefined)?.total ?? 0,
    totalCustomers,
    totalTechnicians,
    averageRating: (avgRatingAgg[0] as { avg?: number } | undefined)?.avg ?? null,
    reviewCount: (avgRatingAgg[0] as { count?: number } | undefined)?.count ?? 0,
    topServices,
  });
});

router.get("/admin/customers", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  await dbConnect();
  const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 }).lean();
  res.json(customers);
});

router.get("/admin/technicians", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  await dbConnect();
  const technicians = await Technician.find({}).populate("userId", "name email phone").lean();
  res.json(technicians);
});

const TechnicianInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  specialties: z.array(z.string()).optional(),
});

router.post("/admin/technicians", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = TechnicianInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }
  await dbConnect();
  let user = await User.findOne({ email: parsed.data.email });
  if (!user) {
    user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      role: "technician",
    });
  } else {
    user.role = "technician";
    await user.save();
  }
  const technician = await Technician.create({
    userId: user._id,
    specialties: parsed.data.specialties ?? [],
  });
  res.status(201).json(technician);
});

const ServiceInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.number().nonnegative().optional(),
  duration: z.string().optional(),
  active: z.boolean().optional(),
});

router.post("/admin/services", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = ServiceInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }
  await dbConnect();
  const service = await Service.create(parsed.data);
  res.status(201).json(service);
});

router.patch("/admin/services/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = ServiceInput.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }
  await dbConnect();
  const service = await Service.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json(service);
});

router.get("/admin/reviews", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  await dbConnect();
  const reviews = await Review.find({})
    .populate("customerId", "name email")
    .populate("serviceId", "name")
    .sort({ createdAt: -1 })
    .lean();
  res.json(reviews);
});

export default router;
