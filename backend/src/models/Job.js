import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, default: "", trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    jobRole: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    urgent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    urgentUntil: { type: Date, default: null },
    expiresAt: { type: Date, required: true },

    views: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false }
  },
  { versionKey: false }
);

JobSchema.index({ expiresAt: 1 });
JobSchema.index({ jobRole: 1, city: 1 });

export default mongoose.model("Job", JobSchema);
