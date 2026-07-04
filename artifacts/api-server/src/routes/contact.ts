import { Router, type IRouter } from "express";
import { z } from "zod";
import { dbConnect } from "../lib/mongo";
import { ContactMessage } from "../models";
import { sendContactNotification } from "../lib/mailer";

const router: IRouter = Router();

const ContactInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

router.post("/contact", async (req, res): Promise<void> => {
  const parsed = ContactInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await dbConnect();
  const doc = await ContactMessage.create(parsed.data);

  try {
    await sendContactNotification(parsed.data);
  } catch (err) {
    req.log.warn({ err }, "Failed to send contact notification email");
  }

  res.status(201).json({ id: doc._id, success: true });
});

export default router;
