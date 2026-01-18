import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    link: { type: String, required: true, unique: true },
    source: { type: String, default: "" },
    publishedAt: { type: Date, default: Date.now },
    summary: { type: String, default: "" },
    important: { type: Boolean, default: false }
  },
  { versionKey: false }
);

NewsSchema.index({ publishedAt: -1 });

export default mongoose.model("News", NewsSchema);
