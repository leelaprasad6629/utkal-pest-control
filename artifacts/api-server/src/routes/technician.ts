import { Router, type IRouter } from "express";
import { z } from "zod";
import { dbConnect } from "../lib/mongo";
import { Booking, ServiceReport, User } from "../models";
import { requireAuth } from "../lib/clerkAuth";
import { createNotification } from "../lib/notifications";

const router: IRouter = Router();

async function requireTechnician(clerkUserId?: string) {
  const user = await User.findOne({ clerkId: clerkUserId });
  if (!user || user.role !== "technician") return null;
  return user;
}

router.get("/technician/jobs", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const tech = await requireTechnician(req.clerkUserId);
  if (!tech) {
    res.status(403).json({ error: "Technician access required" });
    return;
  }
  const jobs = await Booking.find({ technicianId: tech._id })
    .populate("serviceId")
    .populate("customerId", "name email phone")
    .sort({ scheduledDate: 1 })
    .lean();
  res.json(jobs);
});

router.post("/technician/jobs/:id/start", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const tech = await requireTechnician(req.clerkUserId);
  if (!tech) {
    res.status(403).json({ error: "Technician access required" });
    return;
  }
  const booking = await Booking.findOne({ _id: req.params.id, technicianId: tech._id });
  if (!booking) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  booking.status = "in-progress";
  booking.statusHistory.push({ status: "in-progress", changedBy: tech._id, changedAt: new Date() });
  await booking.save();

  await createNotification({
    userId: booking.customerId as never,
    type: "status_update",
    title: "Service started",
    message: `Your technician has started work on booking ${booking.bookingNumber}.`,
    relatedBookingId: booking._id,
  });

  res.json(booking);
});

const CompleteJobInput = z.object({
  beforeImages: z.array(z.string()).optional(),
  afterImages: z.array(z.string()).optional(),
  notes: z.string().optional(),
  customerSignature: z.string().min(1),
});

router.post("/technician/jobs/:id/complete", requireAuth, async (req, res): Promise<void> => {
  const parsed = CompleteJobInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }

  await dbConnect();
  const tech = await requireTechnician(req.clerkUserId);
  if (!tech) {
    res.status(403).json({ error: "Technician access required" });
    return;
  }
  const booking = await Booking.findOne({ _id: req.params.id, technicianId: tech._id });
  if (!booking) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const existingReport = await ServiceReport.findOne({ bookingId: booking._id });
  if (existingReport) {
    res.status(400).json({ error: "Service report already submitted for this job" });
    return;
  }

  await ServiceReport.create({
    bookingId: booking._id,
    technicianId: tech._id,
    beforeImages: parsed.data.beforeImages ?? [],
    afterImages: parsed.data.afterImages ?? [],
    notes: parsed.data.notes,
    customerSignature: parsed.data.customerSignature,
    completedAt: new Date(),
  });

  booking.status = "completed";
  booking.statusHistory.push({ status: "completed", changedBy: tech._id, changedAt: new Date() });
  await booking.save();

  res.json(booking);
});

router.get("/technician/jobs/:id/report", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const user = await User.findOne({ clerkId: req.clerkUserId }).lean<{ _id: unknown; role: string } | null>();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const report = await ServiceReport.findOne({ bookingId: req.params.id }).lean();
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(report);
});

export default router;
