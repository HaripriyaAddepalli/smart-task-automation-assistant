import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { subscriptionGuard } from "../middleware/subscriptionGuard";
import {
  createWorkspace,
  listWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  listMembers,
  assignTask,
  getKanbanBoard,
  moveKanbanTask,
  getActivityFeed,
} from "../controllers/workspaceController";

const router = express.Router();

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

const InviteMemberSchema = z.object({
  inviteEmail: z.string().email(),
  role: z.enum(["admin", "member"]).optional(),
});

const AssignTaskSchema = z.object({
  taskId: z.string().min(1),
  assigneeEmail: z.string().email(),
  column: z.enum(["todo", "in-progress", "done"]).optional(),
});

const MoveTaskSchema = z.object({
  column: z.enum(["todo", "in-progress", "done"]),
  order: z.number().int().min(0),
});

router.post("/", validate(CreateWorkspaceSchema, "body"), subscriptionGuard("workspaces"), createWorkspace);
router.get("/", listWorkspaces);
router.get("/:id", getWorkspace);
router.put("/:id", validate(UpdateWorkspaceSchema, "body"), updateWorkspace);
router.delete("/:id", deleteWorkspace);
router.post("/:id/invite", validate(InviteMemberSchema, "body"), inviteMember);
router.get("/:id/members", listMembers);
router.post("/:id/assign", validate(AssignTaskSchema, "body"), assignTask);
router.get("/:id/kanban", getKanbanBoard);
router.put("/:id/kanban/:assignmentId", validate(MoveTaskSchema, "body"), moveKanbanTask);
router.get("/:id/activity", getActivityFeed);

export default router;
