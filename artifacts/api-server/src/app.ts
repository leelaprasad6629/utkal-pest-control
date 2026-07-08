import express, { type Express, type Request } from "express";
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
// Use process.cwd() so this works when the server runs from the repository root (Render/containers)
const clientDist = path.resolve(process.cwd(), "artifacts", "pest-control", "dist", "public");

if (process.env.NODE_ENV === "production") {
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));

    // Catch-all: serve index.html for non-/api routes (SPA routing)
    app.get("*(?!/api/*)", (req, res) => {
      // If the request is for an API route, delegate to API (shouldn't reach here due to the pattern)
      if (req.path.startsWith("/api/") || req.path === "/api") {
        return res.status(404).send("Not Found");
      }

      res.sendFile(path.join(clientDist, "index.html"));
    });

    logger.info({ clientDist }, "Serving frontend from clientDist");
  } else {
    logger.warn({ clientDist }, "Client dist not found — frontend will not be served by the API server");
  }
}

export default app;
