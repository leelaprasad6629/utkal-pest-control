import { Router, type IRouter, type Request } from "express";
import { Webhook } from "svix";
import { dbConnect } from "../lib/mongo";
import { User } from "../models";
import { logger } from "../lib/logger";
import { normalizeRole } from "../lib/clerkAuth";

const router: IRouter = Router();

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    first_name?: string;
    last_name?: string;
    email_addresses?: { email_address: string }[];
    public_metadata?: Record<string, unknown>;
  };
}

router.post("/webhooks/clerk", async (req: Request, res): Promise<void> => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;

  if (!secret) {
    logger.warn("CLERK_WEBHOOK_SECRET not configured; rejecting webhook");
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  if (!rawBody) {
    res.status(400).json({ error: "Missing raw body for signature verification" });
    return;
  }

  const svixId = req.headers["svix-id"];
  const svixTimestamp = req.headers["svix-timestamp"];
  const svixSignature = req.headers["svix-signature"];

  if (
    typeof svixId !== "string" ||
    typeof svixTimestamp !== "string" ||
    typeof svixSignature !== "string"
  ) {
    res.status(400).json({ error: "Missing svix headers" });
    return;
  }

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    logger.warn({ err }, "Clerk webhook signature verification failed");
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  await dbConnect();

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, first_name, last_name, email_addresses, public_metadata } = event.data;
    const name = [first_name, last_name].filter(Boolean).join(" ") || "Customer";
    const email = email_addresses?.[0]?.email_address ?? `${id}@placeholder.local`;
    // Read role from Clerk public metadata and normalize it
    const role = normalizeRole(public_metadata?.role);

    if (event.type === "user.created") {
      await User.findOneAndUpdate(
        { clerkId: id },
        { $set: { name, email, role }, $setOnInsert: { clerkId: id } },
        { upsert: true, new: true },
      );
    } else {
      // user.updated — always sync name, email, AND role
      await User.findOneAndUpdate(
        { clerkId: id },
        { $set: { name, email, role } },
        { new: true },
      );
    }
  }

  res.json({ received: true });
});

export default router;
