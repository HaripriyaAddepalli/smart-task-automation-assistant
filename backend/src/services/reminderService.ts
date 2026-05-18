import cron from "node-cron";
import Task from "../models/Task";

export const startReminderService = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const tasks = await Task.find({ status: "pending" });

      tasks.forEach((task) => {
        if (task.dueDate && new Date(task.dueDate) < now) {
          console.log("🔔 REMINDER: Task overdue ->", task.title);
        }
      });
    } catch (err) {
      console.error("Reminder service error:", err);
    }
  });

  console.log("⏰ Reminder Service Started");
};