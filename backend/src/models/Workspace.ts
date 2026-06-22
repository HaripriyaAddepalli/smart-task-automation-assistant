import { Schema, model, Document, Types } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  ownerId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    ownerId: { type: String, required: true, index: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default model<IWorkspace>("Workspace", workspaceSchema);

export interface IWorkspaceMember extends Document {
  workspaceId: Types.ObjectId;
  userId: string;
  email: string;
  role: "owner" | "admin" | "member";
  invitedAt: Date;
  joinedAt?: Date;
}

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    userId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
    invitedAt: { type: Date, default: Date.now },
    joinedAt: { type: Date },
  },
  { timestamps: false }
);

workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export const WorkspaceMember = model<IWorkspaceMember>(
  "WorkspaceMember",
  workspaceMemberSchema
);

export interface IAssignedTask extends Document {
  taskId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  assigneeId: string;
  assigneeEmail: string;
  assignedBy: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  column: "todo" | "in-progress" | "done";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const assignedTaskSchema = new Schema<IAssignedTask>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    assigneeId: { type: String, required: true, index: true },
    assigneeEmail: { type: String, required: true },
    assignedBy: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "failed"],
      default: "pending",
    },
    column: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AssignedTask = model<IAssignedTask>("AssignedTask", assignedTaskSchema);

export interface IActivity extends Document {
  workspaceId: Types.ObjectId;
  userId: string;
  userEmail: string;
  action: string;
  entityType: "task" | "workspace" | "member";
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ["task", "workspace", "member"], required: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Activity = model<IActivity>("Activity", activitySchema);
