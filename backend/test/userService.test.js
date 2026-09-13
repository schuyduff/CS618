import assert from "node:assert/strict";
import mongoose from "mongoose";
import { after, before, describe, it } from "node:test";
import { loginUser, registerUser } from "../services/userService.js";

const TEST_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cs618_test";

before(async () => {
  await mongoose.connect(TEST_URI);
  await mongoose.connection.dropCollection("users").catch(() => {});
});

after(async () => {
  await mongoose.connection.close();
});

describe("userService", () => {
  it("registers a user and returns a public profile + JWT", async () => {
    const { user, token } = await registerUser({
      username: "alice",
      email: "alice@example.com",
      password: "hunter2-secure",
    });
    assert.equal(user.username, "alice");
    assert.equal(user.passwordHash, undefined, "must never expose hash");
    assert.ok(token, "issues a JWT");
  });

  it("rejects a duplicate username", async () => {
    await assert.rejects(
      () =>
        registerUser({
          username: "alice",
          email: "alice2@example.com",
          password: "hunter2-secure",
        }),
      /already registered/i,
    );
  });

  it("logs a user in with the correct password", async () => {
    const { user } = await loginUser({
      identifier: "alice",
      password: "hunter2-secure",
    });
    assert.equal(user.username, "alice");
  });

  it("rejects a wrong password", async () => {
    await assert.rejects(
      () =>
        loginUser({ identifier: "alice", password: "wrong-password" }),
      /credentials/i,
    );
  });
});
