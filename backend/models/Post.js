import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;