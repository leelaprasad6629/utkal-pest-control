import express, { type Express, type Request } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { attachClerkUser } from "./lib/clerkAuth";

const app: Express = express();
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const corsOrigins = process.env.CORS_ORIGINS;
app.use(
  cors(
    corsOrigins
      ? {
          origin: corsOrigins.split(",").map((o) => o.trim()).filter(Boolean),
          credentials: true,
        }
      : undefined,
  ),
);
app.use(
  express.json({
    verify: (req: Request & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = Buffer.from(buf);
    },
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(attachClerkUser);

app.use("/api", router);

export default app;
