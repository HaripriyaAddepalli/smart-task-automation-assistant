import { Request, Response } from "express";
import Task from "../models/Task";
import { generateTaskInsights } from "../services/groq-client";
// CREATE TASK
export const createTask = async (req: Request, res: Response) => {
  try {
    const taskData = req.body;

    // 1. Save task FIRST (important)
    const task = await Task.create(taskData);

    // 2. AI insight (non-blocking)
    try {
      const insights = await generateTaskInsights(task);
      task.aiInsights = insights;
      await task.save();
    } catch (err) {
      console.log("AI failed but task saved");
    }

    res.status(201).json(task);
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ message: "Task creation failed" });
  }
};

// GET ALL TASKS
export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// GET SINGLE TASK
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task" });
  }
};

// DELETE TASK
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
};