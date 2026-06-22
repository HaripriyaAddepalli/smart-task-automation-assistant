import { Request, Response } from "express";
import { prioritizeTasks } from "../services/aiPrioritizationService";
import { asyncHandler } from "../middleware/asyncHandler";

export const prioritizeTasksHandler = asyncHandler(
  async (req: Request, res: Response, next) => {
    try {
      const result = await prioritizeTasks(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

