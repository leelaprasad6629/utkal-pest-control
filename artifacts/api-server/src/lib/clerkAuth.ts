import type { Request, Response, NextFunction } from "express";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { logger } from "./logger";

const secretKey = process.env.CLERK_SECRET_KEY ?? "";

export const clerkClient = secretKey ? createClerkClient({ secretKey }) : null;

/** Canonical DB roles */
export type AppRole = "customer" | "technician" | "admin";

/**
 * Normalize any role string coming from Clerk publicMetadata into one of the
 * three canonical DB roles. "manager" is treated as "admin" so the DB enum
 * stays clean. Unknown values fall back to "customer".
 */
export function normalizeRole(raw: unknown): AppRole {
  if (raw === "admin" || raw === "manager") return "admin";
  if (raw === "technician") return "technician";
  return "customer";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      clerkUserId?: string;
    }
  }
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

/**
 * Populates req.clerkUserId when a valid Clerk session token is present.
 * Does not reject the request if no token is present — use requireAuth for that.
 */
export async function attachClerkUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req);
    if (!token || !secretKey) {
      next();
      return;
    }
    const result = await verifyToken(token, { secretKey });
    req.clerkUserId = result.sub;
  } catch (err) {
    logger.warn({ err }, "Failed to verify Clerk token");
  }
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.clerkUserId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}
