import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { prioritizeTasksHandler } from "../controllers/aiPrioritizationController";

const router = express.Router();

const PrioritizeTaskInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const PrioritizeRequestSchema = z.object({
  tasks: z.array(PrioritizeTaskInput).min(1),
  userHistory: z
    .object({
      completedOnTimeRatio: z.number().min(0).max(1).optional(),
      typicalWorkHoursPerDay: z.number().positive().optional(),
    })
    .optional(),
});

router.post(
  "/prioritize",
  validate(PrioritizeRequestSchema, "body"),
  prioritizeTasksHandler
);

export default router;

