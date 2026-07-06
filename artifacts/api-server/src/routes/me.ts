import { Router, type IRouter } from "express";
import { z } from "zod";
import { dbConnect } from "../lib/mongo";
import { User } from "../models";
import { requireAuth, clerkClient } from "../lib/clerkAuth";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const user = await User.findOne({ clerkId: req.clerkUserId }).lean();
  if (!user) {
    res.json({ clerkId: req.clerkUserId, role: "customer", exists: false });
    return;
  }
  res.json(user);
});

const UpdateMeInput = z.object({
  phone: z.string().optional(),
  name: z.string().min(1).optional(),
});

router.patch("/me", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateMeInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }

  await dbConnect();
  let user = await User.findOne({ clerkId: req.clerkUserId });
  if (!user) {
    let name = parsed.data.name ?? "Customer";
    let email = `${req.clerkUserId}@placeholder.local`;
    if (clerkClient && req.clerkUserId) {
      try {
        const clerkUser = await clerkClient.users.getUser(req.clerkUserId);
        name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || name;
        email = clerkUser.emailAddresses[0]?.emailAddress ?? email;
      } catch {
        // fall back to placeholder values
      }
    }
    user = await User.create({ name, email, clerkId: req.clerkUserId, role: "customer" });
  }

  if (parsed.data.phone !== undefined) user.phone = parsed.data.phone;
  if (parsed.data.name !== undefined) user.name = parsed.data.name;
  await user.save();

  res.json(user);
});

export default router;
