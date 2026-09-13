import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Post from "./models/Post.js";
import postsRouter from "./routes/posts.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cs618";
const PORT = process.env.PORT || 3000;

try {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB at ${MONGODB_URI}`);
} catch (err) {
  console.error("Failed to connect to MongoDB:", err.message);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (_req, res) => {
  const count = await Post.countDocuments();
  res.json({
    api: "CS618 Backend",
    database: mongoose.connection.name,
    posts: count,
  });
});

app.use("/api/posts", postsRouter);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});