import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getOrCreateStats, getLeaderboard } from "../services/gamificationService";

export const getMyStats = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { workspaceId } = req.query;
  const stats = await getOrCreateStats(uid, workspaceId as string | undefined);
  res.json(stats);
});

export const getLeaderboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const { workspaceId, limit } = req.query;
  const leaderboard = await getLeaderboard(
    workspaceId as string | undefined,
    limit ? parseInt(limit as string, 10) : 10
  );
  res.json(leaderboard);
});
