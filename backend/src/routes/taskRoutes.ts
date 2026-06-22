import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  applyPrioritization,
} from "../controllers/taskController";
import { validate } from "../middleware/validate";
import { subscriptionGuard } from "../middleware/subscriptionGuard";
import { z } from "zod";

const router = express.Router();

const ApplyPrioritizationSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      dueDate: z.string().datetime(),
      priorityLabel: z.enum(["Urgent", "High", "Medium", "Low"]),
      priorityScore: z.number().int(),
      subtasks: z.array(
        z.object({ title: z.string(), estimatedMinutes: z.number().int() })
      ),
    })
  ),
});

router.post("/", subscriptionGuard("tasks"), createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/apply-prioritization", validate(ApplyPrioritizationSchema, "body"), applyPrioritization);

export default router;
