import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import contactRouter from "./contact";
import bookingsRouter from "./bookings";
import meRouter from "./me";
import webhooksRouter from "./webhooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(servicesRouter);
router.use(contactRouter);
router.use(bookingsRouter);
router.use(meRouter);
router.use(webhooksRouter);

export default router;
