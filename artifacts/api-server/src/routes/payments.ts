import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import Razorpay from "razorpay";
import { dbConnect } from "../lib/mongo";
import { Booking, Invoice, Payment, User } from "../models";
import { requireAuth } from "../lib/clerkAuth";
import { sendPaymentConfirmationEmail } from "../lib/mailer";
import { createNotification } from "../lib/notifications";

const router: IRouter = Router();

function getRazorpayClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

router.get("/payments/config", (_req, res): void => {
  res.json({ configured: Boolean(process.env.RAZORPAY_KEY_ID), keyId: process.env.RAZORPAY_KEY_ID ?? null });
});

const CreateOrderInput = z.object({ bookingId: z.string().min(1) });

router.post("/payments/create-order", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateOrderInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }

  const client = getRazorpayClient();
  if (!client) {
    res.status(501).json({
      error: "Online payments are not configured yet. Please contact support to arrange payment.",
    });
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
    price?: number;
    paymentStatus: string;
    bookingNumber: string;
  } | null>();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  if (String(booking.customerId) !== String(localUser._id)) {
    res.status(403).json({ error: "Not authorized for this booking" });
    return;
  }
  if (!booking.price) {
    res.status(400).json({ error: "Booking has no price set" });
    return;
  }
  if (booking.paymentStatus === "paid") {
    res.status(400).json({ error: "Booking is already paid" });
    return;
  }

  const order = await client.orders.create({
    amount: Math.round(booking.price * 100),
    currency: "INR",
    receipt: booking.bookingNumber,
  });

  await Payment.create({
    bookingId: booking._id,
    amount: booking.price,
    currency: "INR",
    status: "pending",
    method: "razorpay",
    razorpayOrderId: order.id,
  });

  res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
});

const VerifyPaymentInput = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

router.post("/payments/verify", requireAuth, async (req, res): Promise<void> => {
  const parsed = VerifyPaymentInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    res.status(501).json({ error: "Online payments are not configured" });
    return;
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${parsed.data.razorpayOrderId}|${parsed.data.razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== parsed.data.razorpaySignature) {
    res.status(400).json({ error: "Payment verification failed" });
    return;
  }

  await dbConnect();
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: parsed.data.razorpayOrderId },
    {
      status: "successful",
      razorpayPaymentId: parsed.data.razorpayPaymentId,
      razorpaySignature: parsed.data.razorpaySignature,
    },
    { new: true },
  );
  if (!payment) {
    res.status(404).json({ error: "Payment record not found" });
    return;
  }

  const booking = await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: "paid" }, { new: true }).populate(
    "customerId",
  );
  if (booking) {
    await Invoice.findOneAndUpdate(
      { bookingId: booking._id },
      { status: "paid" },
      { upsert: false },
    );

    const customer = booking.customerId as unknown as { _id: unknown; name: string; email: string } | null;
    if (customer) {
      await createNotification({
        userId: customer._id as never,
        type: "payment_success",
        title: "Payment received",
        message: `We received your payment of ₹${payment.amount} for booking ${booking.bookingNumber}.`,
        relatedBookingId: booking._id,
      });
      void sendPaymentConfirmationEmail({
        to: customer.email,
        customerName: customer.name,
        bookingNumber: booking.bookingNumber,
        amount: payment.amount ?? 0,
      });
    }
  }

  res.json({ ok: true, payment });
});

export default router;
