import type { Request, Response } from "express";

import Task from "../models/Task";
import { generateTaskInsights } from "../services/groq-client";
import { asyncHandler } from "../middleware/asyncHandler";
import { emitTaskUpdate } from "../services/socketService";
import { awardTaskCompletion } from "../services/gamificationService";
import User from "../models/User";
import logger from "../config/logger";

const ensureUser = async (uid: string, email: string) => {
  let user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    user = await User.create({ firebaseUid: uid, email });
  }
  return user;
};

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const email = req.user?.email ?? "";
  await ensureUser(uid, email);

  const taskData = { ...req.body, userId: uid };
  const task = await Task.create(taskData);

  try {
    const insights = await generateTaskInsights(task);
    task.aiInsights = insights;
    await task.save();
  } catch {
    logger.warn({ message: "AI insights failed but task saved", taskId: task._id });
  }

  if (task.workspaceId) {
    emitTaskUpdate(task.workspaceId.toString(), "task:created", task);
  }

  res.status(201).json(task);
});

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { workspaceId } = req.query;
  const filter: Record<string, unknown> = { userId: uid };
  if (workspaceId && typeof workspaceId === "string") {
    filter.workspaceId = workspaceId;
  }
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.status(200).json(tasks);
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const task = await Task.findOne({ _id: req.params.id, userId: uid });
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }
  res.status(200).json(task);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const previous = await Task.findOne({ _id: req.params.id, userId: uid });
  if (!previous) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: uid },
    req.body,
    { new: true }
  );

  if (task && req.body.status === "completed" && previous.status !== "completed") {
    await awardTaskCompletion(uid, task._id.toString(), task.workspaceId?.toString());
  }

  if (task?.workspaceId) {
    emitTaskUpdate(task.workspaceId.toString(), "task:updated", task);
  }

  res.status(200).json(task);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: uid });
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  if (task.workspaceId) {
    emitTaskUpdate(task.workspaceId.toString(), "task:deleted", { id: task._id });
  }

  res.status(200).json({ message: "Task deleted successfully" });
});

export const applyPrioritization = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { prioritizedTasks } = req.body as {
    prioritizedTasks: Array<{
      title: string;
      description?: string;
      dueDate: string;
      priorityLabel: "Urgent" | "High" | "Medium" | "Low";
      priorityScore: number;
      subtasks: Array<{ title: string; estimatedMinutes: number }>;
    }>;
  };

  const labelToPriority = {
    Urgent: "high" as const,
    High: "high" as const,
    Medium: "medium" as const,
    Low: "low" as const,
  };

  const updated = [];
  for (const pt of prioritizedTasks) {
    const task = await Task.findOneAndUpdate(
      { userId: uid, title: pt.title },
      {
        dueDate: new Date(pt.dueDate),
        priority: labelToPriority[pt.priorityLabel],
        priorityLabel: pt.priorityLabel,
        priorityScore: pt.priorityScore,
        subtasks: pt.subtasks.map((s) => ({ ...s, completed: false })),
      },
      { new: true }
    );
    if (task) updated.push(task);
  }

  res.json({ updated, count: updated.length });
});
