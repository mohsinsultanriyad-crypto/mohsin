import mongoose from "mongoose";

const PushTokenSchema = new mongoose.Schema({
  token: { type: String, unique: true },
  roles: [String],
  newsEnabled: { type: Boolean, default: false },
  lastSeen: Date
});

export default mongoose.model("PushToken", PushTokenSchema);
