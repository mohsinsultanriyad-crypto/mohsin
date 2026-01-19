import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyName: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String, required: true, index: true },
    city: { type: String, required: true },
    jobRole: { type: String, required: true, index: true },
    description: { type: String, required: true },

    createdAt: { type: Date, default: Date.now, index: true },
    urgentUntil: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: true },

    views: { type: Number, default: 0 }
  },
  { versionKey: false }
);

JobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);
