import { Router, type IRouter } from "express";
import { dbConnect } from "../lib/mongo";
import { Invoice, User } from "../models";
import { requireAuth } from "../lib/clerkAuth";

const router: IRouter = Router();

router.get("/invoices", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const localUser = await User.findOne({ clerkId: req.clerkUserId }).lean<{ _id: unknown; role: string } | null>();
  if (!localUser) {
    res.json([]);
    return;
  }
  const filter = localUser.role === "admin" ? {} : { customerId: localUser._id };
  const invoices = await Invoice.find(filter)
    .populate({ path: "bookingId", populate: { path: "serviceId" } })
    .sort({ createdAt: -1 })
    .lean();
  res.json(invoices);
});

router.get("/invoices/:id", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const localUser = await User.findOne({ clerkId: req.clerkUserId }).lean<{ _id: unknown; role: string } | null>();
  if (!localUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const invoice = await Invoice.findById(req.params.id)
    .populate({ path: "bookingId", populate: [{ path: "serviceId" }, { path: "technicianId", select: "name" }] })
    .populate("customerId", "name email phone")
    .lean<{ customerId?: { _id: unknown } | null } | null>();
  if (!invoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  if (localUser.role !== "admin" && String(invoice.customerId?._id) !== String(localUser._id)) {
    res.status(403).json({ error: "Not authorized to view this invoice" });
    return;
  }
  res.json(invoice);
});

export default router;
