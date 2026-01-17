import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    name: String,
    companyName: String,
    phone: String,
    email: String,
    city: String,
    jobRole: String,
    description: String,
    views: { type: Number, default: 0 },
    urgent: { type: Boolean, default: false },
    urgentUntil: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto delete after 15 days
JobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15 * 24 * 60 * 60 });

export default mongoose.models.Job || mongoose.model("Job", JobSchema);
