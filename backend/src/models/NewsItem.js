import mongoose from "mongoose";

const NewsItemSchema = new mongoose.Schema(
  {
    source: { type: String, default: "Saudi Gazette" },
    title: { type: String, required: true },
    link: { type: String, required: true, unique: true, index: true },
    summary: { type: String, default: "" },
    publishedAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

export default mongoose.model("NewsItem", NewsItemSchema);
