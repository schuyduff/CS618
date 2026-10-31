import mongoose from "mongoose";
import Event from "../models/Event.js";
import Post from "../models/Post.js";

function badRequest(message) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

function validateInput({ title, content }) {
  if (typeof title !== "string" || !title.trim()) {
    throw badRequest("Title is required");
  }
  if (typeof content !== "string" || !content.trim()) {
    throw badRequest("Content is required");
  }
}

export async function createPost({ title, content, author, imageUrl }) {
  validateInput({ title, content });
  return Post.create({ title, content, author, imageUrl });
}

export async function listPosts() {
  return Post.find().sort({ createdAt: -1 });
}

export async function getPost(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  return Post.findById(id);
}

export async function deletePost(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  const post = await Post.findByIdAndDelete(id);
  if (post) await Event.deleteMany({ post: post._id });
  return post;
}
