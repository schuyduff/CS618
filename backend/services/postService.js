import mongoose from "mongoose";
import Post from "../models/Post.js";

function validateInput({ title, content }) {
  if (!title || !title.trim()) {
    throw new Error("Title is required");
  }
  if (!content || !content.trim()) {
    throw new Error("Content is required");
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
  return Post.findByIdAndDelete(id);
}