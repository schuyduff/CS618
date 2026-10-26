import mongoose from "mongoose";

// Uploaded recipe images live in MongoDB: Cloud Run has no persistent disk.
const imageSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);

export default Image;
