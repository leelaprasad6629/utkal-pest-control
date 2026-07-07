import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { dbConnect } from "../lib/mongo";
import { Booking, Payment, Review, Service, Technician, User } from "../models";
import { requireAuth } from "../lib/clerkAuth";

const router: IRouter = Router();

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
  await dbConnect();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalBookings,
    statusCounts,
    revenueAgg,
    todayRevenueAgg,
    monthlyRevenueAgg,
    totalCustomers,
    totalTechnicians,
    avgRatingAgg,
    monthlyBookingsAgg,
    monthlyRevenueChartAgg,
  ] = await Promise.all([
    Booking.countDocuments({}),
    Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Payment.aggregate([
      { $match: { status: "successful" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "successful", createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "successful", createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    User.countDocuments({ role: "customer" }),
    Technician.countDocuments({ status: "active" }),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }]),
    Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Payment.aggregate([
      { $match: { status: "successful", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

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

  const totalRevenue = (revenueAgg[0] as { total?: number } | undefined)?.total ?? 0;
  const completedBookings = bookingsByStatus["completed"] ?? 0;
  const avgBookingValue = completedBookings > 0 ? Math.round(totalRevenue / completedBookings) : 0;

  const monthlyBookings: { month: string; count: number }[] = (
    monthlyBookingsAgg as { _id: { year: number; month: number }; count: number }[]
  ).map((row) => ({
    month: `${MONTH_NAMES[row._id.month - 1]} ${row._id.year}`,
    count: row.count,
  }));

  const revenueByMonth: { month: string; revenue: number }[] = (
    monthlyRevenueChartAgg as { _id: { year: number; month: number }; revenue: number }[]
  ).map((row) => ({
    month: `${MONTH_NAMES[row._id.month - 1]} ${row._id.year}`,
    revenue: row.revenue,
  }));

  res.json({
    totalBookings,
    bookingsByStatus,
    totalRevenue,
    todayRevenue: (todayRevenueAgg[0] as { total?: number } | undefined)?.total ?? 0,
    monthlyRevenue: (monthlyRevenueAgg[0] as { total?: number } | undefined)?.total ?? 0,
    avgBookingValue,
    totalCustomers,
    totalTechnicians,
    averageRating: (avgRatingAgg[0] as { avg?: number } | undefined)?.avg ?? null,
    reviewCount: (avgRatingAgg[0] as { count?: number } | undefined)?.count ?? 0,
    topServices,
    monthlyBookings,
    revenueByMonth,
  });
});

router.get("/admin/customers", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  await dbConnect();
  const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 }).lean();
  res.json(customers);
});

// ─── Technicians CRUD ─────────────────────────────────────────────────────────

router.get("/admin/technicians", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  await dbConnect();
  const technicians = await Technician.find({})
    .populate("userId", "name email phone")
    .sort({ createdAt: -1 })
    .lean();
  res.json(technicians);
});

const TechnicianInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.number().nonnegative().optional(),
  city: z.string().optional(),
  profileImage: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  availability: z
    .array(z.object({ day: z.string(), from: z.string(), to: z.string() }))
    .optional(),
});

router.post("/admin/technicians", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = TechnicianInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }
  await dbConnect();

  // Create or reuse a User record so bookings can reference a User._id
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
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    specialization: parsed.data.specialization,
    experience: parsed.data.experience,
    city: parsed.data.city,
    profileImage: parsed.data.profileImage,
    specialties: parsed.data.specialties ?? [],
    availability: parsed.data.availability ?? [],
    status: "active",
  });

  res.status(201).json(technician);
});

const TechnicianUpdateInput = TechnicianInput.partial();

router.patch("/admin/technicians/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = TechnicianUpdateInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }
  await dbConnect();
  const technician = await Technician.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!technician) {
    res.status(404).json({ error: "Technician not found" });
    return;
  }
  // Sync name/phone to linked User if present
  if (technician.userId && (parsed.data.name || parsed.data.phone)) {
    await User.findByIdAndUpdate(technician.userId, {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
    });
  }
  res.json(technician);
});

router.patch("/admin/technicians/:id/status", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  await dbConnect();
  const technician = await Technician.findById(req.params.id);
  if (!technician) {
    res.status(404).json({ error: "Technician not found" });
    return;
  }
  technician.status = technician.status === "active" ? "inactive" : "active";
  await technician.save();
  res.json(technician);
});

router.delete("/admin/technicians/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  await dbConnect();
  const technician = await Technician.findByIdAndDelete(req.params.id);
  if (!technician) {
    res.status(404).json({ error: "Technician not found" });
    return;
  }
  // Demote linked User back to customer if they have no other technician records
  if (technician.userId) {
    const others = await Technician.countDocuments({ userId: technician.userId });
    if (others === 0) {
      await User.findByIdAndUpdate(technician.userId, { role: "customer" });
    }
  }
  res.status(204).end();
});

// ─── Services CRUD ────────────────────────────────────────────────────────────

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

// ─── Reviews ──────────────────────────────────────────────────────────────────

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
