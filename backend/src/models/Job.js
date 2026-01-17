import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  name: String,
  companyName: String,
  phone: String,
  email: String,
  city: String,
  jobRole: String,
  description: String,

  isUrgent: Boolean,
  urgentUntil: Date,

  views: { type: Number, default: 0 },

  createdAt: Date,
  updatedAt: Date
});

export default mongoose.model("Job", JobSchema);
