import express from "express";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
const router = express.Router();

// temporary storage (later MongoDB)
const users: any[] = [];

/* ---------------- SIGN UP ---------------- */
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  users.push({ email, password: hashed });

  res.json({ message: "User created" });
});

/* ---------------- LOGIN ---------------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(400).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ email }, "SECRET_KEY", { expiresIn: "1d" });

  res.json({ token });
});

/* ---------------- GOOGLE LOGIN ---------------- */
router.post("/google", async (req, res) => {
  try {
    const { name, email, photo, uid } = req.body;

    console.log("Google User Received:", req.body);

    // TODO: later save to MongoDB

    res.json({
      message: "User received successfully",
      user: { name, email, photo, uid },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;