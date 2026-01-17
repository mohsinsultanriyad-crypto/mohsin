import mongoose from "mongoose";

const PushTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    roles: { type: [String], default: [], index: true },
    newsEnabled: { type: Boolean, default: false },
    platform: { type: String, default: "web" },
    userAgent: { type: String, default: "" },
    lastSeen: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("PushToken", PushTokenSchema);
