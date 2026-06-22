import { Schema, model, Document } from "mongoose";

export interface IBadge {
  id: string;
  name: string;
  earnedAt: Date;
}

export interface IUserStats extends Document {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  tasksCompleted: number;
  badges: IBadge[];
  workspaceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const badgeSchema = new Schema<IBadge>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userStatsSchema = new Schema<IUserStats>(
  {
    userId: { type: String, required: true, index: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    tasksCompleted: { type: Number, default: 0 },
    badges: { type: [badgeSchema], default: [] },
    workspaceId: { type: String, index: true },
  },
  { timestamps: true }
);

userStatsSchema.index({ userId: 1, workspaceId: 1 }, { unique: true, sparse: true });

export default model<IUserStats>("UserStats", userStatsSchema);
