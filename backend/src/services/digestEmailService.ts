import cron from "node-cron";
import Task from "../models/Task";
import User from "../models/User";
import { sendEmail } from "./emailService";
import logger from "../config/logger";

export const buildDailyDigest = async (userId: string, email: string): Promise<string> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const pending = await Task.find({ userId, status: { $ne: "completed" } }).sort({ dueDate: 1 });
  const dueToday = pending.filter((t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow);
  const overdue = pending.filter((t) => t.dueDate && new Date(t.dueDate) < today);

  const lines = [
    "Good morning! Here is your daily task digest.",
    "",
    `Pending tasks: ${pending.length}`,
    `Due today: ${dueToday.length}`,
    `Overdue: ${overdue.length}`,
    "",
  ];

  if (dueToday.length > 0) {
    lines.push("Due today:");
    dueToday.forEach((t) => lines.push(`  - ${t.title}${t.priorityLabel ? ` [${t.priorityLabel}]` : ""}`));
    lines.push("");
  }

  if (overdue.length > 0) {
    lines.push("Overdue:");
    overdue.forEach((t) => lines.push(`  - ${t.title}`));
    lines.push("");
  }

  lines.push("Stay productive with Smart Task Assistant!");
  return lines.join("\n");
};

export const sendDailyDigestToUser = async (userId: string, email: string): Promise<void> => {
  const user = await User.findOne({ firebaseUid: userId });
  if (user && !user.notificationPreferences.emailDigest) return;

  const body = await buildDailyDigest(userId, email);
  await sendEmail(email, "Your Daily Task Digest", body);
  logger.info({ message: "Daily digest sent", userId, email });
};

export const sendDeadlineReminder = async (
  userId: string,
  email: string,
  taskTitle: string,
  dueDate: Date
): Promise<void> => {
  const user = await User.findOne({ firebaseUid: userId });
  if (user && !user.notificationPreferences.deadlineReminders) return;

  const body = `Reminder: "${taskTitle}" is due on ${dueDate.toLocaleString()}.\n\nComplete it in Smart Task Assistant to keep your streak going!`;
  await sendEmail(email, `Deadline Reminder: ${taskTitle}`, body);
  logger.info({ message: "Deadline reminder sent", userId, taskTitle });
};

export const startDigestEmailJob = (): void => {
  cron.schedule("0 8 * * *", async () => {
    try {
      const users = await User.find({ "notificationPreferences.emailDigest": true });
      for (const user of users) {
        try {
          await sendDailyDigestToUser(user.firebaseUid, user.email);
        } catch (err) {
          logger.error({ message: "Digest failed for user", userId: user.firebaseUid, error: err });
        }
      }
    } catch (err) {
      logger.error({ message: "Daily digest job error", error: err });
    }
  });
  logger.info("Daily digest email job scheduled (8:00 AM daily)");
};

export const startDeadlineReminderJob = (): void => {
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const tasks = await Task.find({
        status: { $ne: "completed" },
        dueDate: { $exists: true, $ne: null },
      }).populate("userId");

      for (const task of tasks) {
        if (!task.dueDate) continue;
        const due = new Date(task.dueDate);
        const user = await User.findOne({ firebaseUid: task.userId });
        if (!user) continue;

        const diffMs = due.getTime() - now.getTime();
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;

        if ((diffMs <= oneHour && diffMs > oneHour - 3600000) || (diffMs <= oneDay && diffMs > oneDay - 3600000)) {
          try {
            await sendDeadlineReminder(task.userId, user.email, task.title, due);
          } catch (err) {
            logger.error({ message: "Deadline reminder failed", taskId: task._id, error: err });
          }
        }
      }
    } catch (err) {
      logger.error({ message: "Deadline reminder job error", error: err });
    }
  });
  logger.info("Deadline reminder job scheduled (hourly)");
};
