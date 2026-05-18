import Task from "../models/Task";

export const handleVoiceCommand = async (text: string) => {
  const command = text.toLowerCase();

  // CREATE TASK
  if (command.startsWith("create task")) {
    const title = command.replace("create task", "").trim();

    const task = await Task.create({
      title,
      description: title,
      priority: "medium",
    });

    return { action: "task_created", task };
  }

  // GET TASKS
  if (command.includes("show tasks")) {
    const tasks = await Task.find();
    return { action: "show_tasks", tasks };
  }

  // DELETE LAST TASK
  if (command.includes("delete last task")) {
    const task = await Task.findOne().sort({ createdAt: -1 });
    if (task) await task.deleteOne();

    return { action: "task_deleted" };
  }

  return { action: "unknown_command" };
};
