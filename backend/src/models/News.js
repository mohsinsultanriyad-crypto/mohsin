import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true, unique: true, index: true },
    source: { type: String, default: "" },
    publishedAt: { type: Date, default: Date.now, index: true },
    snippet: { type: String, default: "" },
    image: { type: String, default: "" },
    notifiedAt: { type: Date, default: null }
  },
  { versionKey: false }
);

export const News = mongoose.models.News || mongoose.model("News", NewsSchema);
