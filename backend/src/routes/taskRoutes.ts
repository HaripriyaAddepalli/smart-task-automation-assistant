import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  deleteTask,
} from "../controllers/taskController";

const router = express.Router();

// CREATE
router.post("/", createTask);

// GET ALL
router.get("/", getTasks);

// GET ONE
router.get("/:id", getTaskById);

// DELETE
router.delete("/:id", deleteTask);

export default router;