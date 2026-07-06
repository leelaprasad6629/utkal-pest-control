import { Notification, type NotificationType } from "../models";
import { logger } from "./logger";
import mongoose from "mongoose";

interface CreateNotificationInput {
  userId: mongoose.Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  relatedBookingId?: mongoose.Types.ObjectId | string;
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    await Notification.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      relatedBookingId: input.relatedBookingId,
    });
  } catch (err) {
    logger.error({ err, input }, "Failed to create notification");
  }
}
