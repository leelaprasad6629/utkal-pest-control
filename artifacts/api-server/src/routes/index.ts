import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import contactRouter from "./contact";
import bookingsRouter from "./bookings";
import meRouter from "./me";
import webhooksRouter from "./webhooks";
import notificationsRouter from "./notifications";
import reviewsRouter from "./reviews";
import invoicesRouter from "./invoices";
import technicianRouter from "./technician";
import adminRouter from "./admin";
import paymentsRouter from "./payments";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(statsRouter);
router.use(servicesRouter);
router.use(contactRouter);
router.use(bookingsRouter);
router.use(meRouter);
router.use(webhooksRouter);
router.use(notificationsRouter);
router.use(reviewsRouter);
router.use(invoicesRouter);
router.use(technicianRouter);
router.use(adminRouter);
router.use(paymentsRouter);

export default router;
