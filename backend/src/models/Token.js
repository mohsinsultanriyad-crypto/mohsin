import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    roles: { type: [String], default: [] },
    newsEnabled: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const Token = mongoose.models.Token || mongoose.model("Token", TokenSchema);
