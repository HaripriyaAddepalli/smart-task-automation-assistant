import express from "express";
import Task from "../models/Task";

const router = express.Router();

// GET TASK ANALYTICS
router.get("/summary", async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ status: "completed" });
    const pending = await Task.countDocuments({ status: "pending" });
    const highPriority = await Task.countDocuments({ priority: "high" });

    res.json({
      total,
      completed,
      pending,
      highPriority,
    });
  } catch (error) {
    res.status(500).json({ error: "Analytics failed" });
  }
});

export default router;