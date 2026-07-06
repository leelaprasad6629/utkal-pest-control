import { Router, type IRouter } from "express";
import { z } from "zod";
import { dbConnect } from "../lib/mongo";
import { Booking, Review, User } from "../models";
import { requireAuth } from "../lib/clerkAuth";

const router: IRouter = Router();

const ReviewInput = z.object({
  bookingId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
  images: z.array(z.string()).optional(),
});

router.get("/reviews", async (req, res): Promise<void> => {
  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (typeof req.query.serviceId === "string") {
    filter.serviceId = req.query.serviceId;
  }
  const reviews = await Review.find(filter)
    .populate("customerId", "name")
    .populate("serviceId", "name")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json(reviews);
});

router.post("/reviews", requireAuth, async (req, res): Promise<void> => {
  const parsed = ReviewInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }

  await dbConnect();
  const localUser = await User.findOne({ clerkId: req.clerkUserId }).lean<{ _id: unknown } | null>();
  if (!localUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const booking = await Booking.findById(parsed.data.bookingId).lean<{
    _id: unknown;
    customerId?: unknown;
    serviceId?: unknown;
    status: string;
  } | null>();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  if (String(booking.customerId) !== String(localUser._id)) {
    res.status(403).json({ error: "You can only review your own bookings" });
    return;
  }
  if (booking.status !== "completed") {
    res.status(400).json({ error: "You can only review completed bookings" });
    return;
  }

  const existing = await Review.findOne({ bookingId: booking._id });
  if (existing) {
    res.status(400).json({ error: "You have already reviewed this booking" });
    return;
  }

  const review = await Review.create({
    bookingId: booking._id,
    serviceId: booking.serviceId,
    customerId: localUser._id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    images: parsed.data.images ?? [],
  });

  res.status(201).json(review);
});

export default router;
