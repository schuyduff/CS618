import { Router } from "express";
import { getDailyViews, getTotalViews, trackEvent } from "../services/eventService.js";

const router = Router();

// Express 4 does not forward rejected promises to the error handler on its own.
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

router.post(
  "/",
  wrap(async (req, res) => {
    const { postId, session, action } = req.body ?? {};
    res.status(201).json(await trackEvent({ postId, session, action }));
  })
);

router.get(
  "/totalViews/:postId",
  wrap(async (req, res) => {
    res.json({ views: await getTotalViews(req.params.postId) });
  })
);

router.get(
  "/dailyViews/:postId",
  wrap(async (req, res) => {
    res.json(await getDailyViews(req.params.postId));
  })
);

export default router;
