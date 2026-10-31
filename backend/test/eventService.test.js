import assert from "node:assert/strict";
import mongoose from "mongoose";
import { after, before, describe, it } from "node:test";
import { createPost, deletePost } from "../services/postService.js";
import { getDailyViews, getTotalViews, trackEvent } from "../services/eventService.js";
import Event from "../models/Event.js";

const TEST_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cs618_test";

before(async () => {
  await mongoose.connect(TEST_URI);
  await mongoose.connection.dropCollection("events").catch(() => {});
  await mongoose.connection.dropCollection("posts").catch(() => {});
});

after(async () => {
  await mongoose.connection.close();
});

describe("eventService", () => {
  it("rejects invalid input with 400 and missing posts with 404", async () => {
    const post = await createPost({ title: "Views", content: "body" });
    const postId = String(post._id);
    await assert.rejects(() => trackEvent({ postId: "nope", session: "s", action: "startView" }), { statusCode: 400 });
    await assert.rejects(() => trackEvent({ postId, action: "startView" }), { statusCode: 400 });
    await assert.rejects(() => trackEvent({ postId, session: "s", action: "click" }), { statusCode: 400 });
    await assert.rejects(() => trackEvent({ postId, session: "x".repeat(101), action: "startView" }), { statusCode: 400 });
    await assert.rejects(
      () => trackEvent({ postId: String(new mongoose.Types.ObjectId()), session: "s", action: "startView" }),
      { statusCode: 404 },
    );
  });

  it("counts total views and groups daily views by date", async () => {
    const post = await createPost({ title: "Daily", content: "body" });
    const postId = String(post._id);
    const day1 = new Date("2026-01-01T10:00:00Z");
    const day2 = new Date("2026-01-02T10:00:00Z");
    await trackEvent({ postId, session: "a", action: "startView", date: day1 });
    await trackEvent({ postId, session: "a", action: "endView", date: day1 });
    await trackEvent({ postId, session: "b", action: "startView", date: day2 });
    await trackEvent({ postId, session: "c", action: "startView", date: day2 });

    assert.equal(await getTotalViews(postId), 3);
    assert.deepEqual(await getDailyViews(postId), [
      { date: "2026-01-01", views: 1 },
      { date: "2026-01-02", views: 2 },
    ]);
  });

  it("deletes a post's events with the post", async () => {
    const post = await createPost({ title: "Gone", content: "body" });
    await trackEvent({ postId: String(post._id), session: "a", action: "startView" });
    await deletePost(String(post._id));
    assert.equal(await Event.countDocuments({ post: post._id }), 0);
  });
});
