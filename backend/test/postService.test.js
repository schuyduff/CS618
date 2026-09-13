import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import mongoose from "mongoose";
import { createPost, listPosts } from "../services/postService.js";

const TEST_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cs618_test";

describe("postService", () => {
  before(async () => {
    await mongoose.connect(TEST_URI);
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it("createPost persists a post with title and content", async () => {
    const post = await createPost({
      title: "First post",
      content: "Hello from the test suite",
      author: "tester",
    });

    assert.ok(post._id);
    assert.equal(post.title, "First post");
    assert.equal(post.content, "Hello from the test suite");
    assert.equal(post.author, "tester");
  });

  it("listPosts returns posts newest first", async () => {
    await createPost({ title: "Oldest", content: "first" });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await createPost({ title: "Newest", content: "second" });

    const posts = await listPosts();
    assert.equal(posts.length, 2);
    assert.equal(posts[0].title, "Newest");
    assert.equal(posts[1].title, "Oldest");
  });

  it("createPost rejects a post missing a title", async () => {
    await assert.rejects(
      createPost({ title: "", content: "no title here" }),
      /Title is required/
    );
  });
});