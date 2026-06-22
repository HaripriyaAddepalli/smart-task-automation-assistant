import UserStats from "../models/UserStats";
import logger from "../config/logger";

const XP_PER_TASK = 25;
const XP_PER_LEVEL = 100;

const BADGE_THRESHOLDS = [
  { id: "first-task", name: "First Step", tasks: 1 },
  { id: "task-10", name: "Getting Started", tasks: 10 },
  { id: "task-50", name: "Productivity Pro", tasks: 50 },
  { id: "streak-3", name: "3-Day Streak", streak: 3 },
  { id: "streak-7", name: "Week Warrior", streak: 7 },
  { id: "streak-30", name: "Monthly Master", streak: 30 },
  { id: "level-5", name: "Rising Star", level: 5 },
  { id: "level-10", name: "Task Champion", level: 10 },
];

const todayKey = (): string => new Date().toISOString().slice(0, 10);

const yesterdayKey = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export const getOrCreateStats = async (userId: string, workspaceId?: string) => {
  const filter = workspaceId ? { userId, workspaceId } : { userId, workspaceId: { $exists: false } };
  let stats = await UserStats.findOne(filter);
  if (!stats) {
    stats = await UserStats.create({ userId, workspaceId, xp: 0, level: 1, streak: 0, longestStreak: 0, tasksCompleted: 0, badges: [] });
  }
  return stats;
};

const checkBadges = (stats: InstanceType<typeof UserStats>): IBadgeUpdate[] => {
  const earned: IBadgeUpdate[] = [];
  const hasBadge = (id: string) => stats.badges.some((b) => b.id === id);

  for (const threshold of BADGE_THRESHOLDS) {
    if (hasBadge(threshold.id)) continue;
    const earnedByTasks = threshold.tasks !== undefined && stats.tasksCompleted >= threshold.tasks;
    const earnedByStreak = threshold.streak !== undefined && stats.streak >= threshold.streak;
    const earnedByLevel = threshold.level !== undefined && stats.level >= threshold.level;
    if (earnedByTasks || earnedByStreak || earnedByLevel) {
      earned.push({ id: threshold.id, name: threshold.name });
    }
  }
  return earned;
};

interface IBadgeUpdate {
  id: string;
  name: string;
}

export const awardTaskCompletion = async (
  userId: string,
  taskId: string,
  workspaceId?: string
): Promise<{ xpGained: number; newBadges: IBadgeUpdate[]; stats: InstanceType<typeof UserStats> }> => {
  const stats = await getOrCreateStats(userId, workspaceId);

  stats.xp += XP_PER_TASK;
  stats.tasksCompleted += 1;
  stats.level = Math.floor(stats.xp / XP_PER_LEVEL) + 1;

  const today = todayKey();
  const lastActive = stats.lastActiveDate?.toISOString().slice(0, 10);

  if (lastActive === today) {
    // same day, streak unchanged
  } else if (lastActive === yesterdayKey()) {
    stats.streak += 1;
  } else {
    stats.streak = 1;
  }

  if (stats.streak > stats.longestStreak) {
    stats.longestStreak = stats.streak;
  }
  stats.lastActiveDate = new Date();

  const newBadges = checkBadges(stats);
  for (const badge of newBadges) {
    stats.badges.push({ id: badge.id, name: badge.name, earnedAt: new Date() });
  }

  await stats.save();
  logger.info({ message: "Task completion awarded", userId, taskId, xpGained: XP_PER_TASK, newBadges });

  return { xpGained: XP_PER_TASK, newBadges, stats };
};

export const getLeaderboard = async (workspaceId?: string, limit = 10) => {
  const filter = workspaceId ? { workspaceId } : { workspaceId: { $exists: false } };
  return UserStats.find(filter)
    .sort({ xp: -1 })
    .limit(limit)
    .select("userId xp level streak tasksCompleted badges");
};
