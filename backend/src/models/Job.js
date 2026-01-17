import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyName: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String, required: true }, // owner verify for edit/delete
    city: { type: String, required: true },
    jobRole: { type: String, required: true },
    description: { type: String, required: true },

    isUrgent: { type: Boolean, default: false },
    urgentUntil: { type: Date, default: null },

    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Job", JobSchema);
