import { Router } from "express";
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
} from "../services/postService.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

// Express 4 does not forward rejected promises to the error handler on its own.
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

router.get(
  "/",
  optionalAuth,
  wrap(async (req, res) => {
    const posts = await listPosts({ includeAuthor: true, viewer: req.userId });
    res.json({ count: posts.length, posts });
  })
);

router.post(
  "/",
  requireAuth,
  wrap(async (req, res) => {
    const post = await createPost({ ...req.body, author: req.userId });
    res.status(201).json(post);
  })
);

router.get(
  "/:id",
  wrap(async (req, res) => {
    const post = await getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  })
);

router.delete(
  "/:id",
  wrap(async (req, res) => {
    const post = await deletePost(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(204).end();
  })
);

export default router;
