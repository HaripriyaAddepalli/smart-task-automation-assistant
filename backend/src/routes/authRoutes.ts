import express from "express";
import User from "../models/User";
import { asyncHandler } from "../middleware/asyncHandler";
const router = express.Router();

/* ---------------- GOOGLE LOGIN - Persist User to DB ---------------- */
router.post("/google", asyncHandler(async (req, res) => {
  const { uid, email, name, photoURL } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: "Missing uid or email" });
  }

  let user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    user = await User.create({
      firebaseUid: uid,
      email,
      displayName: name,
    });
  }

  res.json({
    message: "User created/updated successfully",
    user: {
      uid: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
    },
  });
}));

export default router;