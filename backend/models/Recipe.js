import mongoose from "mongoose";

// Path returned by POST /api/images for an uploaded file.
export const UPLOADED_IMAGE_PATH = /^\/api\/images\/[a-f0-9]{24}$/;

function isImageUrl(value) {
  if (UPLOADED_IMAGE_PATH.test(value)) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    ingredients: {
      type: [{ type: String, trim: true, maxlength: 200 }],
      validate: {
        validator: (list) => list.length >= 1 && list.length <= 100 && list.every(Boolean),
        message: "Ingredients must be 1-100 non-empty entries",
      },
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: isImageUrl, message: "Image URL must be an http(s) URL or an uploaded image" },
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
