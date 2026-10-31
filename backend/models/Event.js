import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  session: { type: String, required: true },
  action: { type: String, enum: ["startView", "endView"], required: true },
  date: { type: Date, default: Date.now },
});

eventSchema.index({ post: 1, date: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;
