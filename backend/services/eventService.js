import mongoose from "mongoose";
import Event from "../models/Event.js";
import Post from "../models/Post.js";

const ACTIONS = ["startView", "endView"];

function httpError(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

export async function trackEvent({ postId, session, action, date } = {}) {
  if (!mongoose.isValidObjectId(postId)) throw httpError(400, "Invalid post id");
  if (typeof session !== "string" || !session.trim()) throw httpError(400, "Session is required");
  if (session.length > 100) throw httpError(400, "Session is too long");
  if (!ACTIONS.includes(action)) throw httpError(400, "Action must be startView or endView");
  if (!(await Post.exists({ _id: postId }))) throw httpError(404, "Post not found");
  return Event.create({ post: postId, session: session.trim(), action, date });
}

export async function getTotalViews(postId) {
  if (!mongoose.isValidObjectId(postId)) return 0;
  return Event.countDocuments({ post: postId, action: "startView" });
}

export async function getDailyViews(postId) {
  if (!mongoose.isValidObjectId(postId)) return [];
  return Event.aggregate([
    { $match: { post: new mongoose.Types.ObjectId(postId), action: "startView" } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, views: { $count: {} } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", views: 1 } },
  ]);
}
