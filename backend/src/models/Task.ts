import { Schema, model, Document, Types } from "mongoose";

export interface ISubtask {
  title: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  aiInsights?: string;
  userId: string;
  workspaceId?: Types.ObjectId;
  subtasks?: ISubtask[];
  priorityScore?: number;
  priorityLabel?: "Urgent" | "High" | "Medium" | "Low";
  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema<ISubtask>(
  {
    title: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 30 },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "failed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: { type: Date },
    aiInsights: { type: String },
    userId: { type: String, required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", index: true },
    subtasks: { type: [subtaskSchema], default: [] },
    priorityScore: { type: Number },
    priorityLabel: {
      type: String,
      enum: ["Urgent", "High", "Medium", "Low"],
    },
  },
  { timestamps: true }
);

export default model<ITask>("Task", taskSchema);
