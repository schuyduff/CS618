import assert from "node:assert/strict";
import mongoose from "mongoose";
import { after, before, describe, it } from "node:test";
import { createPost, listPosts } from "../services/postService.js";

const TEST_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cs618_test";

before(async () => {
  await mongoose.connect(TEST_URI);
  await mongoose.connection.dropCollection("posts").catch(() => {});
});

after(async () => {
  await mongoose.connection.close();
});

describe("postService", () => {
  it("creates a post with title and content", async () => {
    const post = await createPost({
      title: "Hello, world",
      content: "First post",
    });
    assert.equal(post.title, "Hello, world");
    assert.equal(post.content, "First post");
    assert.ok(post._id);
  });

  it("lists posts newest first", async () => {
    await createPost({ title: "First", content: "one" });
    await createPost({ title: "Second", content: "two" });
    const posts = await listPosts();
    assert.equal(posts[0].title, "Second");
  });

  it("rejects a post missing a title", async () => {
    await assert.rejects(
      () => createPost({ content: "no title" }),
      /title/i,
    );
  });
});
