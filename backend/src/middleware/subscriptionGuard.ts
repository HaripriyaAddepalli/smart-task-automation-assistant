import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import Task from "../models/Task";
import Workspace, { WorkspaceMember } from "../models/Workspace";
import { PLAN_LIMITS, PlanType } from "../config/stripe";
import { cacheGet, cacheSet } from "../config/redis";

export const subscriptionGuard = (resource: "tasks" | "workspaces" | "members" | "ai" | "integrations") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uid = req.user!.uid;
      const user = await User.findOne({ firebaseUid: uid });
      const plan: PlanType = (user?.subscriptionPlan as PlanType) ?? "free";
      const limits = PLAN_LIMITS[plan];

      if (resource === "integrations" && !limits.integrations) {
        return res.status(403).json({
          message: "Integrations require a Pro or Team plan",
          upgradeRequired: true,
        });
      }

      if (resource === "tasks") {
        const count = await Task.countDocuments({ userId: uid });
        if (count >= limits.maxTasks) {
          return res.status(403).json({
            message: `Task limit reached (${limits.maxTasks}) for ${plan} plan`,
            upgradeRequired: true,
          });
        }
      }

      if (resource === "workspaces") {
        const memberships = await WorkspaceMember.countDocuments({ userId: uid });
        if (memberships >= limits.maxWorkspaces) {
          return res.status(403).json({
            message: `Workspace limit reached (${limits.maxWorkspaces}) for ${plan} plan`,
            upgradeRequired: true,
          });
        }
      }

      if (resource === "ai") {
        const cacheKey = `ai:usage:${uid}:${new Date().toISOString().slice(0, 10)}`;
        const usage = (await cacheGet<number>(cacheKey)) ?? 0;
        if (usage >= limits.aiRequestsPerDay) {
          return res.status(429).json({
            message: `AI request limit reached (${limits.aiRequestsPerDay}/day) for ${plan} plan`,
            upgradeRequired: true,
          });
        }
        await cacheSet(cacheKey, usage + 1, 86400);
      }

      next();
    } catch {
      next();
    }
  };
};

export const getUserPlan = async (uid: string): Promise<{ plan: PlanType; limits: (typeof PLAN_LIMITS)[PlanType] }> => {
  const user = await User.findOne({ firebaseUid: uid });
  const plan: PlanType = (user?.subscriptionPlan as PlanType) ?? "free";
  return { plan, limits: PLAN_LIMITS[plan] };
};
