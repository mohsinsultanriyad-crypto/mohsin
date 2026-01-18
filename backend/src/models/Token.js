import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    roles: { type: [String], default: [] },
    newsEnabled: { type: Boolean, default: true },

    badgeCount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export default mongoose.model("Token", TokenSchema);
