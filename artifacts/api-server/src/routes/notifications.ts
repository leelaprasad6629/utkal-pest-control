import { Router, type IRouter } from "express";
import { dbConnect } from "../lib/mongo";
import { Notification, User } from "../models";
import { requireAuth } from "../lib/clerkAuth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const localUser = await User.findOne({ clerkId: req.clerkUserId }).lean<{ _id: unknown } | null>();
  if (!localUser) {
    res.json([]);
    return;
  }
  const notifications = await Notification.find({ userId: localUser._id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json(notifications);
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const localUser = await User.findOne({ clerkId: req.clerkUserId }).lean<{ _id: unknown } | null>();
  if (!localUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: localUser._id },
    { read: true },
    { new: true },
  );
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(notification);
});

router.patch("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  await dbConnect();
  const localUser = await User.findOne({ clerkId: req.clerkUserId }).lean<{ _id: unknown } | null>();
  if (!localUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  await Notification.updateMany({ userId: localUser._id, read: false }, { read: true });
  res.json({ ok: true });
});

export default router;
