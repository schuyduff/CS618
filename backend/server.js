import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Post from "./models/Post.js";
import imagesRouter from "./routes/images.js";
import postsRouter from "./routes/posts.js";
import recipesRouter from "./routes/recipes.js";
import usersRouter from "./routes/users.js";
import { optionalAuth } from "./middleware/auth.js";

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

app.use(optionalAuth);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/images", imagesRouter);

// JSON errors for anything passed to next(err); must stay after the routers.
app.use((err, _req, res, _next) => {
  const isMongooseInput =
    err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError;
  const status = err.statusCode || err.status || (isMongooseInput ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? "Internal server error" : err.message });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
