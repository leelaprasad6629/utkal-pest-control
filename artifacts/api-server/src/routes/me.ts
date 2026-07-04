import { Router, type IRouter } from "express";
import { dbConnect } from "../lib/mongo";
import { User } from "../models";
import { requireAuth } from "../lib/clerkAuth";

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

export default router;
