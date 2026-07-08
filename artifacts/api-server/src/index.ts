import express from "express";
import app, { mountFrontend } from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // After the server has started, mount the frontend static assets so that
  // any errors during static mounting do not prevent the server from listening.
  try {
    const mounted = mountFrontend();
    if (mounted) {
      logger.info("Frontend mounted after server start");
    } else {
      logger.info("Frontend not mounted (dist not found or not in production)");
    }
  } catch (err) {
    logger.warn({ err }, "Failed to mount frontend after server start");
  }
});
