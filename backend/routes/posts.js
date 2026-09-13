import { Router } from "express";
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
} from "../services/postService.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", optionalAuth, async (_req, res) => {
  const posts = await listPosts({ includeAuthor: true, viewer: req.userId });
  res.json({ count: posts.length, posts });
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const post = await createPost({ ...req.body, author: req.userId });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const post = await getPost(req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json(post);
});

router.delete("/:id", async (req, res) => {
  const post = await deletePost(req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.status(204).end();
});

export default router;
