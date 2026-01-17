import mongoose from "mongoose";

const NewsPushLogSchema = new mongoose.Schema(
  {
    token: { type: String, index: true },
    dayKey: { type: String, index: true }, // e.g. "2026-01-17"
    count: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: null }
  },
  { timestamps: true }
);

NewsPushLogSchema.index({ token: 1, dayKey: 1 }, { unique: true });

export default mongoose.model("NewsPushLog", NewsPushLogSchema);
