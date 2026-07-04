import mongoose from "mongoose";
import { logger } from "./logger";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required but was not provided.");
}

let cached = global.__mongooseConn;

if (!cached) {
  cached = global.__mongooseConn = { conn: null, promise: null };
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI).then((m) => {
      logger.info("Connected to MongoDB");
      return m;
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export default dbConnect;
