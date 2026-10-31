// Ensures a few sample blog posts exist and gives each ~14 days of fake views.
import mongoose from "mongoose";
import Event from "../models/Event.js";
import Post from "../models/Post.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cs618";
const DAY = 24 * 60 * 60 * 1000;

const SAMPLE_POSTS = [
  { title: "Why I Bake Sourdough Every Weekend", content: "A starter, flour, water, salt and patience. Here is how a weekly loaf became my favorite ritual.", author: "Seed Bot" },
  { title: "Five Pantry Staples That Save Weeknights", content: "Canned tomatoes, rice, beans, eggs and good olive oil cover more dinners than you would think.", author: "Seed Bot" },
  { title: "Knife Skills for Beginners", content: "Hold the knife by the blade, curl your guiding fingers, and let the knife do the work.", author: "Seed Bot" },
];

await mongoose.connect(MONGODB_URI);

for (const sample of SAMPLE_POSTS) {
  const post =
    (await Post.findOne({ title: sample.title })) ?? (await Post.create(sample));

  let added = 0;
  if (!(await Event.exists({ post: post._id }))) {
    const events = [];
    for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
      const views = Math.floor(Math.random() * 20) + 1;
      for (let i = 0; i < views; i++) {
        // Random time within that day, never in the future.
        const date = new Date(Math.min(Date.now(), Date.now() - daysAgo * DAY + Math.random() * DAY));
        events.push({ post: post._id, session: `seed-${daysAgo}-${i}`, action: "startView", date });
      }
    }
    await Event.insertMany(events);
    added = events.length;
  }
  console.log(`${post._id}  ${post.title}  (+${added} views)`);
}

await mongoose.disconnect();
