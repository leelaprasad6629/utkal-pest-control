import { Router, type IRouter } from "express";
import { z } from "zod";
import { dbConnect } from "../lib/mongo";
import { User } from "../models";
import { requireAuth, clerkClient, normalizeRole } from "../lib/clerkAuth";

const router: IRouter = Router();

/**
 * Fetch role from Clerk publicMetadata for the given clerkUserId.
 * Returns null if clerkClient is not configured or on any error.
 */
async function fetchClerkRole(clerkUserId: string): Promise<"customer" | "technician" | "admin" | null> {
  if (!clerkClient) return null;
  try {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const raw = (clerkUser.publicMetadata as Record<string, unknown>)?.role;
    return normalizeRole(raw);
  } catch {
    return null;
  }
}

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();

  // Fetch Clerk metadata to get the authoritative role
  const clerkRole = await fetchClerkRole(req.clerkUserId!);

  let user = await User.findOne({ clerkId: req.clerkUserId });

  if (!user) {
    // First time this user hits /me — create the record using Clerk data
    let name = "Customer";
    let email = `${req.clerkUserId}@placeholder.local`;
    if (clerkClient) {
      try {
        const clerkUser = await clerkClient.users.getUser(req.clerkUserId!);
        name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || name;
        email = clerkUser.emailAddresses[0]?.emailAddress ?? email;
      } catch {
        // fall back to placeholder values
      }
    }
    const role = clerkRole ?? "customer";

    // Normalize email for case-insensitive dedup.
    const normalizedEmail = email.toLowerCase().trim();

    // If admin pre-created a User with this email (e.g. when adding a technician),
    // atomically link the Clerk ID to that existing record instead of creating a duplicate.
    // We only match records that have no clerkId yet to avoid collisions with existing sessions.
    if (!normalizedEmail.endsWith("@placeholder.local")) {
      const linked = await User.findOneAndUpdate(
        { email: normalizedEmail, clerkId: { $exists: false } },
        { $set: { clerkId: req.clerkUserId!, ...(role ? { role } : {}) } },
        { new: true },
      );
      if (linked) {
        user = linked;
      }
    }

    if (!user) {
      // No pre-existing record — create fresh. Use normalizedEmail for consistency.
      user = await User.create({
        name,
        email: normalizedEmail,
        clerkId: req.clerkUserId,
        role,
      });
    }
  } else if (clerkRole && user.role !== clerkRole) {
    // Clerk is the source of truth — sync the role whenever it drifts
    user.role = clerkRole;
    await user.save();
  }

  res.json(user);
});

const AddressInput = z.object({
  line1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  landmark: z.string().optional(),
});

const UpdateMeInput = z.object({
  phone: z.string().optional(),
  name: z.string().min(1).optional(),
  address: AddressInput.optional(),
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
    let role: "customer" | "technician" | "admin" = "customer";
    if (clerkClient && req.clerkUserId) {
      try {
        const clerkUser = await clerkClient.users.getUser(req.clerkUserId);
        name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || name;
        email = clerkUser.emailAddresses[0]?.emailAddress ?? email;
        role = normalizeRole((clerkUser.publicMetadata as Record<string, unknown>)?.role);
      } catch {
        // fall back to placeholder values
      }
    }
    user = await User.create({ name, email, clerkId: req.clerkUserId, role });
  }

  if (parsed.data.phone !== undefined) user.phone = parsed.data.phone;
  if (parsed.data.name !== undefined) user.name = parsed.data.name;
  if (parsed.data.address !== undefined) {
    if (user.addresses.length > 0) {
      // Update primary address in-place
      Object.assign(user.addresses[0], parsed.data.address);
      user.markModified("addresses");
    } else {
      user.addresses.push(parsed.data.address as typeof user.addresses[0]);
    }
  }
  await user.save();

  res.json(user);
});

export default router;
