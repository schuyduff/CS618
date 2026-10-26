import express, { Router } from "express";
import mongoose from "mongoose";
import Image from "../models/Image.js";
import { requireAuth } from "../middleware/auth.js";

// No SVG: it can carry script.
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const router = Router();

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

router.post(
  "/",
  requireAuth,
  express.raw({ type: IMAGE_TYPES, limit: MAX_IMAGE_BYTES }),
  wrap(async (req, res) => {
    // express.raw leaves req.body unparsed (not a Buffer) for any other content type.
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(415).json({ error: "Upload a PNG, JPEG, WebP or GIF image" });
    }
    const image = await Image.create({
      data: req.body,
      contentType: req.get("Content-Type").split(";")[0].trim().toLowerCase(),
      owner: req.userId,
    });
    res.status(201).json({ url: `/api/images/${image._id}` });
  })
);

router.get(
  "/:id",
  wrap(async (req, res) => {
    const image = mongoose.isValidObjectId(req.params.id) ? await Image.findById(req.params.id) : null;
    if (!image) return res.status(404).json({ error: "Image not found" });
    res.set({
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    res.send(image.data);
  })
);

export default router;
