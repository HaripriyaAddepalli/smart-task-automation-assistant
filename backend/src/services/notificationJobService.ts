import cron from "node-cron";
import Task from "../models/Task";
import User from "../models/User";
import UserStats from "../models/UserStats";
import { sendWhatsAppNotification } from "./whatsappService";
import { sendTelegramNotification } from "./telegramService";
import { buildDailyDigest } from "./digestEmailService";
import logger from "../config/logger";

export const notifyUser = async (
  userId: string,
  title: string,
  body: string
): Promise<{ whatsapp?: string; telegram?: boolean }> => {
  const user = await User.findOne({ firebaseUid: userId });
  if (!user) return {};

  const results: { whatsapp?: string; telegram?: boolean } = {};

  const prefs = user.notificationPreferences;
  if (prefs.whatsappEnabled && prefs.whatsappNumber) {
    try {
      results.whatsapp = await sendWhatsAppNotification(prefs.whatsappNumber, title, body);
    } catch (err) {
      logger.error({ message: "WhatsApp notification failed", userId, error: err });
    }
  }

  if (prefs.telegramEnabled && prefs.telegramChatId) {
    try {
      await sendTelegramNotification(prefs.telegramChatId, title, body);
      results.telegram = true;
    } catch (err) {
      logger.error({ message: "Telegram notification failed", userId, error: err });
    }
  }

  return results;
};

export const notifyAssignment = async (
  assigneeId: string,
  taskTitle: string,
  workspaceName: string
): Promise<void> => {
  const user = await User.findOne({ firebaseUid: assigneeId });
  if (!user || !user.notificationPreferences.assignmentAlerts) return;

  await notifyUser(
    assigneeId,
    "New Task Assignment",
    `You have been assigned "${taskTitle}" in workspace "${workspaceName}".`
  );
};

export const notifyStreakMilestone = async (userId: string, streak: number): Promise<void> => {
  const user = await User.findOne({ firebaseUid: userId });
  if (!user || !user.notificationPreferences.streakMilestones) return;

  if ([3, 7, 14, 30, 60, 100].includes(streak)) {
    await notifyUser(
      userId,
      "Streak Milestone!",
      `Congratulations! You have reached a ${streak}-day streak. Keep it up!`
    );
  }
};

export const startNotificationJobs = (): void => {
  cron.schedule("0 9 * * *", async () => {
    try {
      const users = await User.find({
        $or: [
          { "notificationPreferences.whatsappEnabled": true },
          { "notificationPreferences.telegramEnabled": true },
        ],
      });

      for (const user of users) {
        try {
          const digest = await buildDailyDigest(user.firebaseUid, user.email);
          await notifyUser(user.firebaseUid, "Daily Summary", digest);
        } catch (err) {
          logger.error({ message: "Daily notification failed", userId: user.firebaseUid, error: err });
        }
      }
    } catch (err) {
      logger.error({ message: "Daily notification job error", error: err });
    }
  });

  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const tasks = await Task.find({ status: { $ne: "completed" }, dueDate: { $exists: true } });

      for (const task of tasks) {
        if (!task.dueDate) continue;
        const diffMs = new Date(task.dueDate).getTime() - now.getTime();
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;

        const isOneHour = diffMs <= oneHour && diffMs > oneHour - 3600000;
        const isOneDay = diffMs <= oneDay && diffMs > oneDay - 3600000;

        if (isOneHour || isOneDay) {
          const timeframe = isOneHour ? "1 hour" : "1 day";
          await notifyUser(
            task.userId,
            "Deadline Approaching",
            `"${task.title}" is due in ${timeframe}.`
          );
        }
      }
    } catch (err) {
      logger.error({ message: "Deadline notification job error", error: err });
    }
  });

  cron.schedule("0 20 * * *", async () => {
    try {
      const stats = await UserStats.find({ streak: { $in: [3, 7, 14, 30, 60, 100] } });
      for (const stat of stats) {
        await notifyStreakMilestone(stat.userId, stat.streak);
      }
    } catch (err) {
      logger.error({ message: "Streak notification job error", error: err });
    }
  });

  logger.info("Notification jobs scheduled");
};
