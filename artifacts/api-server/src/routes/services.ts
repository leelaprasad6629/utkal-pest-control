import { Router, type IRouter } from "express";
import { dbConnect } from "../lib/mongo";
import { Service } from "../models";

const router: IRouter = Router();

router.get("/services", async (req, res): Promise<void> => {
  await dbConnect();
  const services = await Service.find({ active: true }).sort({ name: 1 }).lean();
  req.log.info({ count: services.length }, "Listed services");
  res.json(services);
});

router.get("/services/:slug", async (req, res): Promise<void> => {
  const raw = req.params.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  await dbConnect();
  const service = await Service.findOne({ slug, active: true }).lean();
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json(service);
});

export default router;
