import express from "express";
import { getMyStats, getLeaderboardHandler } from "../controllers/gamificationController";

const router = express.Router();

router.get("/me", getMyStats);
router.get("/leaderboard", getLeaderboardHandler);

export default router;
