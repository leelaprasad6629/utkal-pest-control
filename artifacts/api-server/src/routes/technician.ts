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

/**
 * GET /technician/profile
 * Returns the Technician record linked to the logged-in user.
 * 404 if no Technician record exists — frontend uses this to show the
 * "No technician profile found. Contact administrator." guard.
 */
router.get("/technician/profile", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const user = await User.findOne({ clerkId: req.clerkUserId });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (user.role !== "technician") {
    res.status(403).json({ error: "Not a technician account" });
    return;
  }
  const { Technician } = await import("../models");
  const profile = await Technician.findOne({ userId: user._id }).lean();
  if (!profile) {
    res.status(404).json({
      code: "NO_TECHNICIAN_PROFILE",
      error: "No technician profile found. Contact administrator.",
    });
    return;
  }
  res.json(profile);
});

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

/**
 * POST /technician/jobs/:id/en-route
 * Moves a booking from technician-assigned/confirmed → en-route.
 * This is the intermediate "Update Status" step the spec requires.
 */
router.post("/technician/jobs/:id/en-route", requireAuth, async (req, res): Promise<void> => {
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
  // Only allow from technician-assigned (the canonical post-assignment state)
  if (booking.status !== "technician-assigned") {
    res.status(400).json({
      error: `Cannot mark en-route from status "${booking.status}". Must be "technician-assigned".`,
    });
    return;
  }
  booking.status = "en-route";
  booking.statusHistory.push({ status: "en-route", changedBy: tech._id, changedAt: new Date() });
  await booking.save();

  await createNotification({
    userId: booking.customerId as never,
    type: "status_update",
    title: "Technician en route",
    message: `Your technician is on the way for booking ${booking.bookingNumber}.`,
    relatedBookingId: booking._id,
  });

  res.json(booking);
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
  if (booking.status !== "en-route") {
    res.status(400).json({
      error: `Cannot start job from status "${booking.status}". Must be "en-route". Mark yourself en-route first.`,
    });
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
  if (booking.status !== "in-progress") {
    res.status(400).json({
      error: `Cannot complete job from status "${booking.status}". Must be "in-progress". Start the job first.`,
    });
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
