import assert from "node:assert/strict";
import mongoose from "mongoose";
import { after, before, describe, it } from "node:test";
import User from "../models/User.js";
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  updateRecipe,
} from "../services/recipeService.js";

const TEST_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cs618_test";

const valid = {
  title: "Pancakes",
  ingredients: ["flour", "milk", "eggs"],
  imageUrl: "https://example.com/pancakes.jpg",
};

let owner;
let other;

before(async () => {
  await mongoose.connect(TEST_URI);
  await mongoose.connection.dropCollection("recipes").catch(() => {});
  const suffix = Date.now().toString(36);
  [owner, other] = await User.create([
    { username: `chef_${suffix}`, email: `chef_${suffix}@example.com`, passwordHash: "x" },
    { username: `other_${suffix}`, email: `other_${suffix}@example.com`, passwordHash: "x" },
  ]);
});

after(async () => {
  await User.deleteMany({ _id: { $in: [owner._id, other._id] } });
  await mongoose.connection.close();
});

describe("recipeService", () => {
  it("creates a recipe with the author populated", async () => {
    const recipe = await createRecipe({ ...valid, title: "  Pancakes  " }, owner._id);
    assert.equal(recipe.title, "Pancakes");
    assert.deepEqual([...recipe.ingredients], valid.ingredients);
    assert.equal(recipe.author.username, owner.username);
    assert.equal(recipe.author.email, undefined, "only username is populated");
    assert.ok(recipe.createdAt);
  });

  it("drops blank ingredients and trims the rest", async () => {
    const recipe = await createRecipe(
      { ...valid, ingredients: [" salt ", "", "   ", "pepper"] },
      owner._id
    );
    assert.deepEqual([...recipe.ingredients], ["salt", "pepper"]);
  });

  it("ignores author in the body", async () => {
    const recipe = await createRecipe({ ...valid, author: other._id }, owner._id);
    assert.equal(String(recipe.author._id), String(owner._id));
  });

  for (const [name, input, pattern] of [
    ["missing title", { ...valid, title: "  " }, /title/i],
    ["too-long title", { ...valid, title: "x".repeat(121) }, /title/i],
    ["empty ingredients", { ...valid, ingredients: ["", " "] }, /ingredient/i],
    ["non-array ingredients", { ...valid, ingredients: "flour" }, /ingredient/i],
    ["missing image URL", { ...valid, imageUrl: undefined }, /image/i],
    ["unparseable image URL", { ...valid, imageUrl: "not a url" }, /image/i],
    ["javascript: image URL", { ...valid, imageUrl: "javascript:alert(1)" }, /image/i],
  ]) {
    it(`rejects ${name} with 400`, async () => {
      await assert.rejects(
        () => createRecipe(input, owner._id),
        (err) => err.statusCode === 400 && pattern.test(err.message)
      );
    });
  }

  it("lists newest first and filters by author", async () => {
    await createRecipe({ ...valid, title: "Older" }, other._id);
    await createRecipe({ ...valid, title: "Newer" }, other._id);
    const all = await listRecipes();
    assert.equal(all[0].title, "Newer");
    assert.equal(all[1].title, "Older");

    const mine = await listRecipes({ author: String(other._id) });
    assert.deepEqual(mine.map((r) => r.title), ["Newer", "Older"]);
    assert.deepEqual(await listRecipes({ author: "nope" }), []);
  });

  it("lets the owner update a subset of fields", async () => {
    const recipe = await createRecipe(valid, owner._id);
    const updated = await updateRecipe(recipe._id, owner._id, {
      title: "Better pancakes",
      author: other._id,
    });
    assert.equal(updated.title, "Better pancakes");
    assert.deepEqual([...updated.ingredients], valid.ingredients);
    assert.equal(updated.author.username, owner.username);
    await assert.rejects(
      () => updateRecipe(recipe._id, owner._id, { ingredients: [] }),
      (err) => err.statusCode === 400
    );
  });

  it("forbids updates and deletes by non-owners", async () => {
    const recipe = await createRecipe(valid, owner._id);
    const forbidden = (err) =>
      err.statusCode === 403 && err.message === "You can only modify your own recipes";
    await assert.rejects(() => updateRecipe(recipe._id, other._id, { title: "Hijacked" }), forbidden);
    await assert.rejects(() => deleteRecipe(recipe._id, other._id), forbidden);
    assert.equal((await getRecipe(recipe._id)).title, "Pancakes");
  });

  it("returns 404 for missing or invalid ids and deletes for the owner", async () => {
    const recipe = await createRecipe(valid, owner._id);
    await deleteRecipe(recipe._id, owner._id);
    assert.equal(await getRecipe(recipe._id), null);
    assert.equal(await getRecipe("not-an-id"), null);
    const notFound = (err) => err.statusCode === 404;
    await assert.rejects(() => updateRecipe(recipe._id, owner._id, { title: "x" }), notFound);
    await assert.rejects(() => deleteRecipe("not-an-id", owner._id), notFound);
  });

  it("accepts an uploaded image path but not other relative paths", async () => {
    const uploaded = "/api/images/0123456789abcdef01234567";
    const recipe = await createRecipe({ ...valid, imageUrl: uploaded }, owner._id);
    assert.equal(recipe.imageUrl, uploaded);
    for (const imageUrl of ["/api/images/../users", "/etc/passwd", "file:///tmp/x.png"]) {
      await assert.rejects(() => createRecipe({ ...valid, imageUrl }, owner._id), (err) => err.statusCode === 400);
    }
  });
});
