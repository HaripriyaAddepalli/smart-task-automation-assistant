import { Request, Response } from "express";
import { Types } from "mongoose";
import Workspace, { WorkspaceMember, AssignedTask, Activity } from "../models/Workspace";
import Task from "../models/Task";
import User from "../models/User";
import { asyncHandler } from "../middleware/asyncHandler";
import { emitTaskUpdate, emitAssignmentUpdate } from "../services/socketService";
import logger from "../config/logger";

const param = (value: string | string[]): string =>
  Array.isArray(value) ? value[0] : value;

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

const ensureUser = async (uid: string, email: string) => {
  let user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    user = await User.create({ firebaseUid: uid, email });
  }
  return user;
};

const assertMember = async (workspaceId: string, userId: string) => {
  const member = await WorkspaceMember.findOne({
    workspaceId: new Types.ObjectId(workspaceId),
    userId,
  });
  if (!member) {
    const err = new Error("Not a workspace member") as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }
  return member;
};

const logActivity = async (
  workspaceId: string,
  userId: string,
  userEmail: string,
  action: string,
  entityType: "task" | "workspace" | "member",
  entityId: string,
  metadata?: Record<string, unknown>
) => {
  await Activity.create({
    workspaceId: new Types.ObjectId(workspaceId),
    userId,
    userEmail,
    action,
    entityType,
    entityId,
    metadata,
  });
};

export const createWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const email = req.user!.email ?? "";
  const { name, description } = req.body as { name: string; description?: string };

  await ensureUser(uid, email);

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;
  while (await Workspace.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const workspace = await Workspace.create({
    name,
    slug,
    ownerId: uid,
    description,
  });

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: uid,
    email,
    role: "owner",
    joinedAt: new Date(),
  });

  await logActivity(workspace._id.toString(), uid, email, "workspace.created", "workspace", workspace._id.toString());

  res.status(201).json(workspace);
});

export const listWorkspaces = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const memberships = await WorkspaceMember.find({ userId: uid });
  const workspaceIds = memberships.map((m) => m.workspaceId);
  const workspaces = await Workspace.find({ _id: { $in: workspaceIds } }).sort({ updatedAt: -1 });
  res.json(workspaces);
});

export const getWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { id: rawId } = req.params;
  const id = param(rawId);
  await assertMember(id, uid);
  const workspace = await Workspace.findById(id);
  if (!workspace) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }
  res.json(workspace);
});

export const updateWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const email = req.user!.email ?? "";
  const { id: rawId } = req.params;
  const id = param(rawId);
  const member = await assertMember(id, uid);
  if (member.role === "member") {
    res.status(403).json({ message: "Insufficient permissions" });
    return;
  }

  const { name, description } = req.body as { name?: string; description?: string };
  const workspace = await Workspace.findByIdAndUpdate(
    id,
    { ...(name && { name }), ...(description !== undefined && { description }) },
    { new: true }
  );

  if (!workspace) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  await logActivity(id, uid, email, "workspace.updated", "workspace", id);
  res.json(workspace);
});

export const deleteWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { id: rawId } = req.params;
  const id = param(rawId);
  const workspace = await Workspace.findById(id);
  if (!workspace) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }
  if (workspace.ownerId !== uid) {
    res.status(403).json({ message: "Only the owner can delete a workspace" });
    return;
  }

  await AssignedTask.deleteMany({ workspaceId: id });
  await Activity.deleteMany({ workspaceId: id });
  await WorkspaceMember.deleteMany({ workspaceId: id });
  await Task.updateMany({ workspaceId: id }, { $unset: { workspaceId: 1 } });
  await Workspace.findByIdAndDelete(id);

  res.json({ message: "Workspace deleted" });
});

export const inviteMember = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const email = req.user!.email ?? "";
  const { id: rawId } = req.params;
  const id = param(rawId);
  const { inviteEmail, role = "member" } = req.body as { inviteEmail: string; role?: "admin" | "member" };

  const member = await assertMember(id, uid);
  if (member.role === "member") {
    res.status(403).json({ message: "Insufficient permissions" });
    return;
  }

  const existing = await WorkspaceMember.findOne({
    workspaceId: new Types.ObjectId(id),
    email: inviteEmail.toLowerCase(),
  });
  if (existing) {
    res.status(409).json({ message: "User already invited or member" });
    return;
  }

  const invitedUser = await User.findOne({ email: inviteEmail.toLowerCase() });
  const newMember = await WorkspaceMember.create({
    workspaceId: new Types.ObjectId(id),
    userId: invitedUser?.firebaseUid ?? `pending:${inviteEmail}`,
    email: inviteEmail.toLowerCase(),
    role,
    joinedAt: invitedUser ? new Date() : undefined,
  });

  await logActivity(id, uid, email, "member.invited", "member", newMember._id.toString(), { inviteEmail });
  res.status(201).json(newMember);
});

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { id: rawId } = req.params;
  const id = param(rawId);
  await assertMember(id, uid);
  const members = await WorkspaceMember.find({ workspaceId: new Types.ObjectId(id) });
  res.json(members);
});

export const assignTask = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const email = req.user!.email ?? "";
  const { id: rawId } = req.params;
  const id = param(rawId);
  const { taskId, assigneeEmail, column = "todo" } = req.body as {
    taskId: string;
    assigneeEmail: string;
    column?: "todo" | "in-progress" | "done";
  };

  await assertMember(id, uid);

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const assignee = await User.findOne({ email: assigneeEmail.toLowerCase() });
  const assigneeId = assignee?.firebaseUid ?? `pending:${assigneeEmail}`;

  const maxOrder = await AssignedTask.findOne({ workspaceId: new Types.ObjectId(id), column })
    .sort({ order: -1 })
    .select("order");
  const order = (maxOrder?.order ?? -1) + 1;

  const assignment = await AssignedTask.create({
    taskId: new Types.ObjectId(taskId),
    workspaceId: new Types.ObjectId(id),
    assigneeId,
    assigneeEmail: assigneeEmail.toLowerCase(),
    assignedBy: uid,
    column,
    order,
    status: column === "done" ? "completed" : column === "in-progress" ? "in-progress" : "pending",
  });

  await Task.findByIdAndUpdate(taskId, { workspaceId: new Types.ObjectId(id) });
  await logActivity(id, uid, email, "task.assigned", "task", taskId, { assigneeEmail });

  emitAssignmentUpdate(id, { assignment, task });
  res.status(201).json(assignment);
});

export const getKanbanBoard = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { id: rawId } = req.params;
  const id = param(rawId);
  await assertMember(id, uid);

  const assignments = await AssignedTask.find({ workspaceId: new Types.ObjectId(id) })
    .sort({ column: 1, order: 1 })
    .populate("taskId");

  const columns = {
    todo: assignments.filter((a) => a.column === "todo"),
    "in-progress": assignments.filter((a) => a.column === "in-progress"),
    done: assignments.filter((a) => a.column === "done"),
  };

  res.json(columns);
});

export const moveKanbanTask = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const email = req.user!.email ?? "";
  const { id: rawId, assignmentId: rawAssignmentId } = req.params;
  const id = param(rawId);
  const assignmentId = param(rawAssignmentId);
  const { column, order } = req.body as { column: "todo" | "in-progress" | "done"; order: number };

  await assertMember(id, uid);

  const statusMap = {
    todo: "pending" as const,
    "in-progress": "in-progress" as const,
    done: "completed" as const,
  };

  const assignment = await AssignedTask.findOneAndUpdate(
    { _id: assignmentId, workspaceId: new Types.ObjectId(id) },
    { column, order, status: statusMap[column] },
    { new: true }
  ).populate("taskId");

  if (!assignment) {
    res.status(404).json({ message: "Assignment not found" });
    return;
  }

  const task = assignment.taskId as unknown as { _id: Types.ObjectId };
  if (task?._id) {
    await Task.findByIdAndUpdate(task._id, { status: statusMap[column] });
  }

  await logActivity(id, uid, email, "task.moved", "task", assignmentId, { column, order });

  emitTaskUpdate(id, "task:moved", { assignment });
  res.json(assignment);
});

export const getActivityFeed = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { id: rawId } = req.params;
  const id = param(rawId);
  await assertMember(id, uid);

  const activities = await Activity.find({ workspaceId: new Types.ObjectId(id) })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(activities);
});
