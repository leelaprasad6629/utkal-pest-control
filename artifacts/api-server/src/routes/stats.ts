import { Router, type IRouter } from "express";
import { dbConnect } from "../lib/mongo";
import { Booking, Review, Technician, User } from "../models";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  await dbConnect();
  const [totalCustomers, totalBookings, totalTechnicians, avgRatingAgg] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Booking.countDocuments({}),
    Technician.countDocuments({ status: "active" }),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }]),
  ]);
  res.json({
    totalCustomers,
    totalBookings,
    totalTechnicians,
    averageRating: (avgRatingAgg[0] as { avg?: number } | undefined)?.avg ?? null,
    reviewCount: (avgRatingAgg[0] as { count?: number } | undefined)?.count ?? 0,
  });
});

export default router;
