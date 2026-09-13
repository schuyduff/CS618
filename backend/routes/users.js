import { Router } from "express";
import { loginUser, registerUser } from "../services/userService.js";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(err.statusCode || 400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);
    res.json({ user, token });
  } catch (err) {
    res.status(err.statusCode || 400).json({ error: err.message });
  }
});

export default router;
