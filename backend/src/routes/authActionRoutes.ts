import express from "express";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/requireAuth";
import { z } from "zod";
import { upsertOnboardingData } from "../controllers/authActionController";

const router = express.Router();

const OnboardingActionSchema = z.object({
  action: z.enum(["generate_readme", "generate_onboarding_doc"]).optional(),
  data: z.record(z.string(), z.any()).optional(),
});

// Protected by Firebase auth
router.put(
  "/onboarding",
  requireAuth,
  validate(OnboardingActionSchema, "body"),
  upsertOnboardingData
);

export default router;

