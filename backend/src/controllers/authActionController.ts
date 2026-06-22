import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import User from "../models/User";

const AuthActionSchema = z.object({
  action: z.enum(["generate_readme", "generate_onboarding_doc"]).optional(),
  // Allow free-form extra data from the client.
  // Example: { audience: "users", tone: "friendly" }
  data: z.record(z.string(), z.any()).optional(),
});


export const upsertOnboardingData = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  const email = req.user?.email ?? "";

  if (!uid) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const parsed = AuthActionSchema.parse(req.body);

  // Ensure user model supports onboardingData.
  // Store arbitrary action metadata under onboardingData.

  // Ensure user exists.

  let user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    user = await User.create({ firebaseUid: uid, email });
  }

  // If the user already completed onboarding, keep step at completed.
  (user as any).onboardingCompleted = true;
  (user as any).onboardingStep = "completed";

  (user as any).onboardingData = {
    action: parsed.action ?? "generate_onboarding_doc",

    data: parsed.data ?? {},
    completedAt: new Date().toISOString(),
  };

  await user.save();

  res.json({
    onboardingCompleted: (user as any).onboardingCompleted,

    onboardingStep: (user as any).onboardingStep,
    onboardingData: (user as any).onboardingData,
  });
});



