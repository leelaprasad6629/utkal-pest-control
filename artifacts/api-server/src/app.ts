import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { attachClerkUser } from "./lib/clerkAuth";
import path from "path";
import fs from "fs";

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

// Serve frontend in production
// The frontend build output is at: artifacts/pest-control/dist/public (vite build outDir)
// Try multiple candidate paths so the server works whether it's started from the repo root
// or from the api-server package dir (Render may start with cwd=artifacts/api-server).
const candidates = [
  path.resolve(process.cwd(), "artifacts", "pest-control", "dist", "public"),
  path.resolve(process.cwd(), "..", "artifacts", "pest-control", "dist", "public"),
  path.resolve(process.cwd(), "..", "..", "artifacts", "pest-control", "dist", "public"),
];

let clientDist: string | undefined;
for (const c of candidates) {
  if (fs.existsSync(c)) {
    clientDist = c;
    break;
  }
}

if (process.env.NODE_ENV === "production" && clientDist) {
  app.use(express.static(clientDist));

  // SPA fallback: use express middleware to serve index.html for non-API GET requests.
  // Express 5 no longer accepts wildcard route strings like "*" in the same way,
  // so use app.use and a runtime check to skip API routes and only handle GET requests.
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Only handle GET requests for client-side navigation
    if (req.method !== "GET") return next();

    // Skip API routes entirely so they are handled by the API router
    if (req.path === "/api" || req.path.startsWith("/api/")) return next();

    // If a static asset exists that matches the request, let express.static serve it first
    // (express.static was registered above). If not, serve index.html so the SPA can handle the route.
    const potentialFile = path.join(clientDist, req.path.replace(/^(\/)/, ""));
    if (fs.existsSync(potentialFile) && fs.statSync(potentialFile).isFile()) {
      return next();
    }

    res.sendFile(path.join(clientDist, "index.html"));
  });

  logger.info({ clientDist }, "Serving frontend from clientDist");
} else if (process.env.NODE_ENV === "production") {
  logger.warn({ candidates }, "Client dist not found — frontend will not be served by the API server");
}

export default app;
