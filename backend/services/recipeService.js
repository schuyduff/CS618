import mongoose from "mongoose";
import Recipe, { UPLOADED_IMAGE_PATH } from "../models/Recipe.js";

function httpError(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function badRequest(message) {
  return httpError(400, message);
}

// Validates and normalizes the fields present in `input`; `partial` skips missing ones (PATCH).
function normalize(input = {}, partial = false) {
  const out = {};

  if (!partial || input.title !== undefined) {
    const title = typeof input.title === "string" ? input.title.trim() : "";
    if (!title) throw badRequest("Title is required");
    if (title.length > 120) throw badRequest("Title must be at most 120 characters");
    out.title = title;
  }

  if (!partial || input.ingredients !== undefined) {
    if (!Array.isArray(input.ingredients) || input.ingredients.some((i) => typeof i !== "string")) {
      throw badRequest("Ingredients must be a list of strings");
    }
    const ingredients = input.ingredients.map((i) => i.trim()).filter(Boolean);
    if (ingredients.length === 0) throw badRequest("At least one ingredient is required");
    if (ingredients.length > 100) throw badRequest("At most 100 ingredients allowed");
    if (ingredients.some((i) => i.length > 200)) {
      throw badRequest("Each ingredient must be at most 200 characters");
    }
    out.ingredients = ingredients;
  }

  if (!partial || input.imageUrl !== undefined) {
    const imageUrl = typeof input.imageUrl === "string" ? input.imageUrl.trim() : "";
    if (!imageUrl) throw badRequest("Image URL is required");
    if (UPLOADED_IMAGE_PATH.test(imageUrl)) {
      out.imageUrl = imageUrl;
      return out;
    }
    let protocol;
    try {
      protocol = new URL(imageUrl).protocol;
    } catch {
      throw badRequest("Image URL must be a valid URL");
    }
    if (protocol !== "http:" && protocol !== "https:") {
      throw badRequest("Image URL must start with http:// or https://");
    }
    out.imageUrl = imageUrl;
  }

  return out;
}

async function findOwned(id, userId) {
  const recipe = mongoose.isValidObjectId(id) ? await Recipe.findById(id) : null;
  if (!recipe) throw httpError(404, "Recipe not found");
  if (String(recipe.author) !== String(userId)) {
    throw httpError(403, "You can only modify your own recipes");
  }
  return recipe;
}

export async function createRecipe(input, userId) {
  const recipe = await Recipe.create({ ...normalize(input), author: userId });
  return recipe.populate("author", "username");
}

export async function listRecipes({ author } = {}) {
  const filter = {};
  if (author !== undefined) {
    if (!mongoose.isValidObjectId(author)) return [];
    filter.author = author;
  }
  return Recipe.find(filter).sort({ createdAt: -1, _id: -1 }).populate("author", "username");
}

export async function getRecipe(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Recipe.findById(id).populate("author", "username");
}

export async function updateRecipe(id, userId, updates) {
  const recipe = await findOwned(id, userId);
  recipe.set(normalize(updates, true));
  await recipe.save();
  return recipe.populate("author", "username");
}

export async function deleteRecipe(id, userId) {
  const recipe = await findOwned(id, userId);
  await recipe.deleteOne();
}
